import React, { useState, useEffect } from 'react';
import { db, uploadToCloudinary } from '../../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import './AdminPanel.css';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('cars'); // 'cars' or 'bookings'
  
  // Cars & Categories State
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  
  // Form State for Add/Edit Car
  const [editingCarId, setEditingCarId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', imageFile: null, existingImage: '' });
  const [uploading, setUploading] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState([]);

  // Fetch Data
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const fetchedCats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(fetchedCats);
    if(fetchedCats.length > 0 && !formData.category) {
        setFormData(prev => ({...prev, category: fetchedCats[0].name}));
    }
  };

  const fetchCars = async () => {
    const querySnapshot = await getDocs(collection(db, "cars"));
    setCars(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBookings = async () => {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    setBookings(data);
  };

  useEffect(() => { 
    fetchCategories();
    fetchCars(); 
    fetchBookings();
  }, []);

  // Category Actions
  const handleAddCategory = async () => {
    if(!newCategory.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCategory });
    setNewCategory('');
    fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    if(window.confirm("Delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories();
    }
  }

  // Car Actions
  const handleSaveCar = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = formData.existingImage;
      if (formData.imageFile) {
        imageUrl = await uploadToCloudinary(formData.imageFile);
      }

      const carData = {
        name: formData.name,
        pricePerKm: formData.price,
        category: formData.category,
        image: imageUrl
      };

      if (editingCarId) {
        await updateDoc(doc(db, "cars", editingCarId), carData);
        alert("Car Updated Successfully!");
      } else {
        await addDoc(collection(db, "cars"), carData);
        alert("Car Added Successfully!");
      }

      setFormData({ name: '', price: '', category: categories.length > 0 ? categories[0].name : '', imageFile: null, existingImage: '' });
      setEditingCarId(null);
      fetchCars();
    } catch(err) {
      alert("Error saving car: " + err.message);
    }
    setUploading(false);
  };

  const handleEditCar = (car) => {
    setEditingCarId(car.id);
    setFormData({
      name: car.name,
      price: car.pricePerKm,
      category: car.category,
      imageFile: null,
      existingImage: car.image
    });
  };

  const handleDeleteCar = async (id) => {
    if(window.confirm("Are you sure you want to delete this car?")) {
      await deleteDoc(doc(db, "cars", id));
      fetchCars();
    }
  };

  const cancelEdit = () => {
    setEditingCarId(null);
    setFormData({ name: '', price: '', category: categories.length > 0 ? categories[0].name : '', imageFile: null, existingImage: '' });
  };

  // Booking Actions
  const handleDeleteBooking = async (id) => {
    if(window.confirm("Are you sure you want to delete this booking history?")) {
      await deleteDoc(doc(db, "bookings", id));
      fetchBookings();
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Rahi Travels Admin</h2>
        <div className="admin-tabs">
          <button className={activeTab === 'cars' ? 'active-tab' : ''} onClick={() => setActiveTab('cars')}>Manage Cars & Categories</button>
          <button className={activeTab === 'bookings' ? 'active-tab' : ''} onClick={() => setActiveTab('bookings')}>User Bookings</button>
        </div>
      </div>

      {activeTab === 'cars' && (
        <div className="admin-content">
          <div className="admin-sidebar">
            <div className="card">
              <h3>Manage Categories</h3>
              <div className="category-input">
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category (e.g. SUV)" />
                <button onClick={handleAddCategory}>Add</button>
              </div>
              <ul className="category-list">
                {categories.map(cat => (
                  <li key={cat.id}>
                    {cat.name} 
                    <button onClick={() => handleDeleteCategory(cat.id)} className="delete-btn-small">x</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3>{editingCarId ? 'Edit Car' : 'Add New Car'}</h3>
              <form onSubmit={handleSaveCar} className="admin-form">
                <input type="text" placeholder="Car Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="text" placeholder="Price (e.g. ₹15/km)" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                {formData.existingImage && (
                  <div className="current-image-preview">
                    <img src={formData.existingImage} alt="Current" />
                    <small>Upload new to replace</small>
                  </div>
                )}
                <input type="file" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} required={!editingCarId} />
                
                <div className="form-actions">
                  <button type="submit" disabled={uploading} className="primary-btn">
                    {uploading ? 'Saving...' : (editingCarId ? 'Update Car' : 'Publish Car')}
                  </button>
                  {editingCarId && <button type="button" onClick={cancelEdit} className="secondary-btn">Cancel</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="admin-main">
            <h3>Car Inventory</h3>
            <div className="car-grid">
              {cars.map(car => (
                <div key={car.id} className="car-card">
                  <img src={car.image} alt={car.name} />
                  <div className="car-info">
                    <h4>{car.name}</h4>
                    <span className="car-badge">{car.category}</span>
                    <p>{car.pricePerKm}</p>
                    <div className="car-actions">
                      <button onClick={() => handleEditCar(car)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDeleteCar(car.id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="admin-content full-width">
          <h3>Booking History</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Journey</th>
                  <th>Pickup Time</th>
                  <th>Car Preference</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan="7" className="text-center">No bookings found</td></tr>
                )}
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.createdAt ? new Date(b.createdAt.toMillis()).toLocaleString() : 'N/A'}</td>
                    <td>{b.name}</td>
                    <td>{b.mobile}<br/>{b.email}</td>
                    <td>{b.from} &rarr; {b.to}</td>
                    <td>{b.date} {b.time}</td>
                    <td>{b.car || 'Any'}</td>
                    <td>
                      <button onClick={() => handleDeleteBooking(b.id)} className="delete-btn-small">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};