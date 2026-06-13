import React, { useState, useEffect } from 'react';
import { db, uploadToCloudinary } from '../../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import './AdminPanel.css';

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [activeTab, setActiveTab] = useState('cars'); // 'cars', 'bookings', 'gallery', 'hero', 'users', 'places'
  
  // Cars & Categories State
  const [cars, setCars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  
  // Form State for Add/Edit Car
  const [editingCarId, setEditingCarId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', seats: '5', fuelType: 'Petrol', features: '', serialNo: '', imageFile: null, existingImage: '', galleryUrls: ['', '', '', '', '', '', ''], galleryFiles: [null, null, null, null, null, null, null] });
  const [uploading, setUploading] = useState(false);
  const [conflictCar, setConflictCar] = useState(null);
  
  // WhatsApp Settings State
  const [whatsappSettings, setWhatsappSettings] = useState({ enabled: false, phone: '', apiKey: '' });
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  
  // Users State
  const [users, setUsers] = useState([]);

  // Places State
  const [places, setPlaces] = useState([]);
  const [placeForm, setPlaceForm] = useState({ name: '', photoUrls: [''], city: '' });
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [placeSections, setPlaceSections] = useState([]);
  const [newPlaceSection, setNewPlaceSection] = useState('');

  // Visitors State
  const [visitors, setVisitors] = useState([]);
  const [visitorStats, setVisitorStats] = useState({ today: 0, yesterday: 0, week: 0, month: 0, year: 0, lifetime: 0 });

  // Bookings State
  const [bookings, setBookings] = useState([]);
  
  // Gallery State
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Hero State
  const [heroImages, setHeroImages] = useState([]);
  const [heroFile, setHeroFile] = useState(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroRemoveBg, setHeroRemoveBg] = useState(false);

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
    const fetchedCars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const getCarSortOrder = (car) => {
      if (car.serialNo !== undefined && car.serialNo !== null && car.serialNo !== '') {
        return Number(car.serialNo);
      }
      const cat = (car.category || '').toLowerCase();
      if (cat.includes('sedan')) return 1000;
      if (cat.includes('hatchback')) return 2000;
      if (cat.includes('suv')) return 3000;
      if (cat.includes('muv')) return 4000;
      if (cat.includes('bus')) return 5000;
      return 99999;
    };

    fetchedCars.sort((a, b) => getCarSortOrder(a) - getCarSortOrder(b));
    setCars(fetchedCars);
  };

  const fetchWhatsappSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "whatsapp"));
      if (docSnap.exists()) {
        setWhatsappSettings(docSnap.data());
      }
    } catch (err) {
      console.error("Error fetching WhatsApp settings:", err);
    }
  };

  const fetchBookings = async () => {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    setBookings(data);
  };
  
  const fetchGalleryPhotos = async () => {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    setGalleryPhotos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  const fetchHeroImages = async () => {
    const querySnapshot = await getDocs(collection(db, "hero_images"));
    setHeroImages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchPlaces = async () => {
    const querySnapshot = await getDocs(collection(db, "places"));
    setPlaces(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchPlaceSections = async () => {
    const querySnapshot = await getDocs(collection(db, "place_sections"));
    const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlaceSections(fetched);
    if (fetched.length > 0 && !placeForm.city) {
      setPlaceForm(prev => ({ ...prev, city: fetched[0].name }));
    }
  };

  const fetchVisitors = async () => {
    const querySnapshot = await getDocs(collection(db, "visitors"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVisitors(data);

    // Calculate Stats
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    let stats = { today: 0, yesterday: 0, week: 0, month: 0, year: 0, lifetime: data.length };

    data.forEach(v => {
      if (!v.timestamp) return;
      const vDate = new Date(v.timestamp.toMillis());
      
      if (v.dateString === todayStr) stats.today++;
      if (v.dateString === yesterdayStr) stats.yesterday++;
      if (vDate >= sevenDaysAgo) stats.week++;
      if (vDate >= firstDayOfMonth) stats.month++;
      if (vDate >= firstDayOfYear) stats.year++;
    });

    setVisitorStats(stats);
  };

  useEffect(() => { 
    if (isAuthenticated) {
      fetchCategories();
      fetchCars(); 
      fetchBookings();
      fetchGalleryPhotos();
      fetchHeroImages();
      fetchUsers();
      fetchPlaces();
      fetchPlaceSections();
      fetchVisitors();
      fetchWhatsappSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'Rahi@2026') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form onSubmit={handleLogin} className="admin-login-form">
          <h2>Admin Login</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={passwordInput} 
            onChange={(e) => setPasswordInput(e.target.value)} 
            required 
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

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
    
    // Check for duplicate serial number
    const enteredSerial = formData.serialNo !== '' ? Number(formData.serialNo) : '';
    if (enteredSerial !== '' && enteredSerial !== 0) {
      const conflict = cars.find(c => Number(c.serialNo) === enteredSerial && c.id !== editingCarId);
      if (conflict) {
        setConflictCar(conflict);
        return;
      }
    }

    setUploading(true);
    try {
      let imageUrl = formData.existingImage;
      if (formData.imageFile) {
        imageUrl = await uploadToCloudinary(formData.imageFile);
      }

      let finalGalleryUrls = [];
      for (let i = 0; i < 7; i++) {
        if (formData.galleryFiles[i]) {
          const url = await uploadToCloudinary(formData.galleryFiles[i]);
          if (url) finalGalleryUrls.push(url);
        } else if (formData.galleryUrls[i] && formData.galleryUrls[i].trim() !== '') {
          finalGalleryUrls.push(formData.galleryUrls[i]);
        }
      }

      const carData = {
        name: formData.name,
        pricePerKm: formData.price,
        category: formData.category,
        seats: formData.seats,
        fuelType: formData.fuelType,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
        galleryUrls: finalGalleryUrls,
        image: imageUrl,
        serialNo: formData.serialNo !== '' ? Number(formData.serialNo) : ''
      };

      if (editingCarId) {
        await updateDoc(doc(db, "cars", editingCarId), carData);
        alert("Car Updated Successfully!");
      } else {
        await addDoc(collection(db, "cars"), carData);
        alert("Car Added Successfully!");
      }

      setFormData({ name: '', price: '', category: categories.length > 0 ? categories[0].name : '', seats: '5', fuelType: 'Petrol', features: '', serialNo: '', imageFile: null, existingImage: '', galleryUrls: ['', '', '', '', '', '', ''], galleryFiles: [null, null, null, null, null, null, null] });
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
      seats: car.seats || '5',
      fuelType: car.fuelType || 'Petrol',
      features: car.features ? car.features.join(', ') : '',
      serialNo: car.serialNo !== undefined ? car.serialNo : '',
      imageFile: null,
      existingImage: car.image,
      galleryUrls: car.galleryUrls ? [...car.galleryUrls, '', '', '', '', '', '', ''].slice(0, 7) : ['', '', '', '', '', '', ''],
      galleryFiles: [null, null, null, null, null, null, null]
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
    setFormData({ name: '', price: '', category: categories.length > 0 ? categories[0].name : '', seats: '5', fuelType: 'Petrol', features: '', serialNo: '', imageFile: null, existingImage: '', galleryUrls: ['', '', '', '', '', '', ''], galleryFiles: [null, null, null, null, null, null, null] });
  };

  // WhatsApp Alert saving Action
  const handleSaveWhatsappSettings = async (e) => {
    e.preventDefault();
    setSavingWhatsapp(true);
    try {
      await setDoc(doc(db, "settings", "whatsapp"), whatsappSettings);
      alert("WhatsApp Notification Settings Saved successfully!");
    } catch (err) {
      alert("Error saving settings: " + err.message);
    }
    setSavingWhatsapp(false);
  };

  // Booking Actions
  const handleDeleteBooking = async (id) => {
    if(window.confirm("Are you sure you want to delete this booking history?")) {
      await deleteDoc(doc(db, "bookings", id));
      fetchBookings();
    }
  };
  
  // Gallery Actions
  const handleAddGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!galleryFile) return;
    setGalleryUploading(true);
    try {
      const url = await uploadToCloudinary(galleryFile);
      if (url) {
        await addDoc(collection(db, "gallery"), { url });
        alert("Photo added to gallery!");
        setGalleryFile(null);
        fetchGalleryPhotos();
      } else {
        alert("Failed to upload image. Check Cloudinary settings.");
      }
    } catch (err) {
      alert("Error saving photo: " + err.message);
    }
    setGalleryUploading(false);
  };
  
  const handleDeleteGalleryPhoto = async (id) => {
    if(window.confirm("Delete this photo from gallery?")) {
      await deleteDoc(doc(db, "gallery", id));
      fetchGalleryPhotos();
    }
  };

  // Hero Actions
  const handleAddHeroImage = async (e) => {
    e.preventDefault();
    if (!heroFile) return;
    setHeroUploading(true);
    try {
      const url = await uploadToCloudinary(heroFile);
      if (url) {
        await addDoc(collection(db, "hero_images"), { 
          url, 
          removeBg: heroRemoveBg,
          createdAt: new Date() 
        });
        alert("Hero image added!");
        setHeroFile(null);
        setHeroRemoveBg(false);
        fetchHeroImages();
      }
    } catch (err) {
      alert("Error saving hero image: " + err.message);
    }
    setHeroUploading(false);
  };

  const handleDeleteHeroImage = async (id) => {
    if(window.confirm("Delete this hero image?")) {
      await deleteDoc(doc(db, "hero_images", id));
      fetchHeroImages();
    }
  };

  const handleToggleHeroBgRemoval = async (id, currentVal) => {
    try {
      await updateDoc(doc(db, "hero_images", id), { removeBg: !currentVal });
      fetchHeroImages();
    } catch (err) {
      alert("Error updating background removal setting: " + err.message);
    }
  };

  // Place Section Actions
  const handleAddPlaceSection = async () => {
    if (!newPlaceSection.trim()) return;
    if (placeSections.some(s => s.name.toLowerCase() === newPlaceSection.trim().toLowerCase())) {
      alert("Section already exists!");
      return;
    }
    try {
      await addDoc(collection(db, "place_sections"), { name: newPlaceSection.trim() });
      setNewPlaceSection('');
      fetchPlaceSections();
    } catch (err) {
      alert("Error adding section: " + err.message);
    }
  };

  const handleDeletePlaceSection = async (id) => {
    if (window.confirm("Delete this place section? Note: Places inside this section will not be deleted but they won't show in the dropdown anymore.")) {
      try {
        await deleteDoc(doc(db, "place_sections", id));
        fetchPlaceSections();
      } catch (err) {
        alert("Error deleting section: " + err.message);
      }
    }
  };

  // Place Actions
  const handleSavePlace = async (e) => {
    e.preventDefault();
    const validUrls = placeForm.photoUrls.filter(url => url.trim() !== '');
    if (!placeForm.name || validUrls.length === 0 || !placeForm.city) {
      alert("Please provide at least one valid image URL, name, and select a section.");
      return;
    }
    
    try {
      const data = { name: placeForm.name, photoUrls: validUrls, city: placeForm.city };
      // Keep legacy photoUrl populated for safety, set it to the first image
      data.photoUrl = validUrls[0];

      if (editingPlaceId) {
        await updateDoc(doc(db, "places", editingPlaceId), data);
        alert("Place Updated Successfully!");
      } else {
        await addDoc(collection(db, "places"), data);
        alert("Place Added Successfully!");
      }
      setPlaceForm({ name: '', photoUrls: [''], city: placeSections.length > 0 ? placeSections[0].name : '' });
      setEditingPlaceId(null);
      fetchPlaces();
    } catch(err) {
      alert("Error saving place: " + err.message);
    }
  };

  const handleEditPlace = (place) => {
    setEditingPlaceId(place.id);
    let urls = [''];
    if (place.photoUrls && place.photoUrls.length > 0) urls = place.photoUrls;
    else if (place.photoUrl) urls = [place.photoUrl];

    setPlaceForm({
      name: place.name,
      photoUrls: urls,
      city: place.city || (placeSections.length > 0 ? placeSections[0].name : '')
    });
  };

  const cancelEditPlace = () => {
    setEditingPlaceId(null);
    setPlaceForm({ name: '', photoUrls: [''], city: placeSections.length > 0 ? placeSections[0].name : '' });
  };
  
  const addPlaceUrlField = () => {
    setPlaceForm({ ...placeForm, photoUrls: [...placeForm.photoUrls, ''] });
  };

  const removePlaceUrlField = (index) => {
    const newUrls = [...placeForm.photoUrls];
    newUrls.splice(index, 1);
    setPlaceForm({ ...placeForm, photoUrls: newUrls });
  };
  
  const updatePlaceUrlField = (index, value) => {
    const newUrls = [...placeForm.photoUrls];
    newUrls[index] = value;
    setPlaceForm({ ...placeForm, photoUrls: newUrls });
  };

  const handleDeletePlace = async (id) => {
    if(window.confirm("Are you sure you want to delete this place?")) {
      await deleteDoc(doc(db, "places", id));
      fetchPlaces();
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Rahi Travels Admin</h2>
        <div className="admin-tabs">
          <button className={activeTab === 'cars' ? 'active-tab' : ''} onClick={() => setActiveTab('cars')}>Manage Cars</button>
          <button className={activeTab === 'bookings' ? 'active-tab' : ''} onClick={() => setActiveTab('bookings')}>User Bookings</button>
          <button className={activeTab === 'gallery' ? 'active-tab' : ''} onClick={() => setActiveTab('gallery')}>Gallery Manager</button>
          <button className={activeTab === 'hero' ? 'active-tab' : ''} onClick={() => setActiveTab('hero')}>Hero Manager</button>
          <button className={activeTab === 'users' ? 'active-tab' : ''} onClick={() => setActiveTab('users')}>Users</button>
          <button className={activeTab === 'places' ? 'active-tab' : ''} onClick={() => setActiveTab('places')}>Places</button>
          <button className={activeTab === 'whatsapp' ? 'active-tab' : ''} onClick={() => setActiveTab('whatsapp')}>WhatsApp Alerts</button>
          <button className={activeTab === 'analytics' ? 'active-tab' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
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
                <select value={formData.seats} onChange={(e) => setFormData({...formData, seats: e.target.value})} required>
                  <option value="5">5 Seats</option>
                  <option value="7">7 Seats</option>
                  <option value="8">8 Seats</option>
                  <option value="12">12 Seats</option>
                </select>
                <select value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})} required>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="EV">EV (Electric)</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Serial Number (e.g. 1 for first)" 
                  value={formData.serialNo} 
                  onChange={(e) => setFormData({...formData, serialNo: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px' }}
                />
                <textarea 
                  placeholder="Point features (comma separated, e.g. AC, Bluetooth, Sunroof)" 
                  value={formData.features} 
                  onChange={(e) => setFormData({...formData, features: e.target.value})} 
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px' }}
                />
                {formData.existingImage && (
                  <div className="current-image-preview">
                    <img src={formData.existingImage} alt="Current" />
                    <small>Upload new to replace</small>
                  </div>
                )}
                <input type="file" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} required={!editingCarId} />
                
                <h4 style={{marginTop: '15px'}}>Car Gallery Images (Max 7)</h4>
                {formData.galleryUrls.map((url, i) => (
                  <div key={i} style={{ marginBottom: '10px' }}>
                    {url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <img src={url} alt={`Gallery ${i+1}`} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        <small>Existing Image {i+1}</small>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const newFiles = [...formData.galleryFiles];
                        newFiles[i] = e.target.files[0];
                        setFormData({...formData, galleryFiles: newFiles});
                      }} 
                    />
                  </div>
                ))}
                
                <div className="form-actions" style={{marginTop: '15px'}}>
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
                    <h4>{car.name} ({car.seats || '5'} Seater)</h4>
                    <span className="car-badge">{car.category}</span>
                    <span className="car-badge" style={{background: '#10b981', marginLeft: '5px'}}>{car.fuelType || 'Petrol'}</span>
                    <span className="car-badge" style={{background: '#6b7280', color: 'white', marginLeft: '5px'}}>Order: {car.serialNo !== undefined && car.serialNo !== '' ? car.serialNo : 'N/A'}</span>
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
      
      {activeTab === 'gallery' && (
        <div className="admin-content full-width">
          <div className="card" style={{ marginBottom: '20px', maxWidth: '500px' }}>
            <h3>Upload to "Our Trust Moments"</h3>
            <form onSubmit={handleAddGalleryPhoto} className="admin-form">
              <input type="file" onChange={(e) => setGalleryFile(e.target.files[0])} required />
              <button type="submit" disabled={galleryUploading} className="primary-btn">
                {galleryUploading ? 'Uploading...' : 'Add Photo'}
              </button>
            </form>
          </div>
          
          <h3>Gallery Images ({galleryPhotos.length}/30)</h3>
          <div className="car-grid">
            {galleryPhotos.map(photo => (
              <div key={photo.id} className="car-card">
                <img src={photo.url} alt="Gallery" />
                <div className="car-info" style={{ textAlign: 'center' }}>
                  <button onClick={() => handleDeleteGalleryPhoto(photo.id)} className="delete-btn" style={{ width: '100%' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="admin-content full-width">
          <div className="card" style={{ marginBottom: '20px', maxWidth: '500px' }}>
            <h3>Manage Hero Images (Slideshow)</h3>
            <p style={{ color: 'gray', marginBottom: '10px' }}>If 1 photo: No slideshow. If &gt;1 photos: Slideshow enabled.</p>
            <form onSubmit={handleAddHeroImage} className="admin-form">
              <input type="file" onChange={(e) => setHeroFile(e.target.files[0])} required />
              <label className="checkbox-label">
                <input type="checkbox" checked={heroRemoveBg} onChange={(e) => setHeroRemoveBg(e.target.checked)} />
                Auto Background Removal (Cloudinary AI)
              </label>
              <button type="submit" disabled={heroUploading} className="primary-btn">
                {heroUploading ? 'Uploading...' : 'Add Hero Photo'}
              </button>
            </form>
          </div>
          
          <h3>Hero Images ({heroImages.length})</h3>
          <div className="car-grid">
            {heroImages.map(img => (
              <div key={img.id} className="car-card">
                <img src={img.url} alt="Hero" />
                <div className="car-info" style={{ textAlign: 'center' }}>
                  <label className="checkbox-label" style={{ marginBottom: '10px', display: 'block' }}>
                    <input type="checkbox" checked={img.removeBg || false} onChange={() => handleToggleHeroBgRemoval(img.id, img.removeBg)} />
                    Remove BG
                  </label>
                  <button onClick={() => handleDeleteHeroImage(img.id)} className="delete-btn" style={{ width: '100%' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-content full-width">
          <h3>Registered Users</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan="5" className="text-center">No users found</td></tr>
                )}
                {users.map(u => {
                  const userBookings = bookings.filter(b => b.email === u.email || b.mobile === u.phone);
                  return (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.phone}</td>
                      <td>{u.email}</td>
                      <td>{u.createdAt ? new Date(u.createdAt.toMillis()).toLocaleDateString() : 'N/A'}</td>
                      <td>{userBookings.length} bookings</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'places' && (
        <div className="admin-content">
          <div className="admin-sidebar">
            <div className="card">
              <h3>Manage Place Sections</h3>
              <div className="category-input">
                <input 
                  type="text" 
                  value={newPlaceSection} 
                  onChange={(e) => setNewPlaceSection(e.target.value)} 
                  placeholder="New Section (e.g. Ayodhya Darshan)" 
                />
                <button type="button" onClick={handleAddPlaceSection}>Add</button>
              </div>
              <ul className="category-list">
                {placeSections.map(sec => (
                  <li key={sec.id}>
                    {sec.name} 
                    <button type="button" onClick={() => handleDeletePlaceSection(sec.id)} className="delete-btn-small">x</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3>{editingPlaceId ? 'Edit Service Location' : 'Add Service Location'}</h3>
              <form onSubmit={handleSavePlace} className="admin-form">
                <select 
                  value={placeForm.city} 
                  onChange={(e) => setPlaceForm({...placeForm, city: e.target.value})} 
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px' }}
                >
                  <option value="" disabled>Select Section</option>
                  {placeSections.map(sec => <option key={sec.id} value={sec.name}>{sec.name}</option>)}
                </select>
                
                <input 
                  type="text" 
                  placeholder="Place Name (e.g. Ram Mandir)" 
                  required 
                  value={placeForm.name} 
                  onChange={(e) => setPlaceForm({...placeForm, name: e.target.value})} 
                />
                
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '5px' }}>Image URLs (Slideshow)</label>
                  {placeForm.photoUrls.map((url, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      {url && (
                        <img src={url} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                      )}
                      <input 
                        type="url" 
                        placeholder="Photo URL (Direct Link)" 
                        required={index === 0} 
                        value={url} 
                        onChange={(e) => updatePlaceUrlField(index, e.target.value)} 
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                      {placeForm.photoUrls.length > 1 && (
                        <button type="button" onClick={() => removePlaceUrlField(index)} className="delete-btn-small" style={{ padding: '10px' }}>&times;</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addPlaceUrlField} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Another Image Link</button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" className="primary-btn" style={{ flex: 1 }}>{editingPlaceId ? 'Update Place' : 'Add Place'}</button>
                  {editingPlaceId && <button type="button" onClick={cancelEditPlace} className="secondary-btn">Cancel</button>}
                </div>
              </form>
            </div>
          </div>
          
          <div className="admin-main">
            <h3>Service Places</h3>
            <div className="car-grid">
              {places.map(p => (
                <div key={p.id} className="car-card">
                  <div style={{ position: 'relative', height: '150px' }}>
                    <img src={p.photoUrls && p.photoUrls.length > 0 ? p.photoUrls[0] : p.photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {p.photoUrls && p.photoUrls.length > 1 && (
                      <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        {p.photoUrls.length} Images
                      </div>
                    )}
                  </div>
                  <div className="car-info">
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', display: 'block', marginBottom: '5px' }}>{p.city || 'Other'}</span>
                    <h4>{p.name}</h4>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => handleEditPlace(p)} className="edit-btn" style={{ flex: 1 }}>Edit</button>
                      <button onClick={() => handleDeletePlace(p.id)} className="delete-btn" style={{ flex: 1 }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="admin-content full-width">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '25px' }}>
            <h3>WhatsApp Booking Notifications</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Receive a WhatsApp notification directly to your phone instantly whenever a new booking is submitted on the website. This service uses the completely free <strong>CallMeBot API</strong>.
            </p>
            
            <div className="alert-info" style={{ background: '#f0f9ff', borderLeft: '4px solid #0284c7', padding: '15px', borderRadius: '4px', marginBottom: '25px', fontSize: '0.9rem' }}>
              <h4 style={{ color: '#0369a1', margin: '0 0 8px 0', fontWeight: 'bold' }}>How to setup for FREE:</h4>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#334155' }}>
                <li style={{ marginBottom: '6px' }}>Add the phone number <strong>+34 621 07 36 12</strong> (or the current CallMeBot WhatsApp number) to your phone contacts.</li>
                <li style={{ marginBottom: '6px' }}>Send a WhatsApp message saying: <strong>I allow callmebot to send me messages</strong> to that number.</li>
                <li style={{ marginBottom: '6px' }}>Wait for the reply from the bot with your unique <strong>API Key</strong>.</li>
                <li>Enter your phone number (with country code, e.g. +91XXXXXXXXXX) and the API key below.</li>
              </ol>
            </div>

            <form onSubmit={handleSaveWhatsappSettings} className="admin-form">
              <label className="checkbox-label" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                <input 
                  type="checkbox" 
                  checked={whatsappSettings.enabled || false} 
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, enabled: e.target.checked })}
                />
                Enable Instant WhatsApp Booking Alerts
              </label>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Admin Phone Number (with country code)</label>
                <input 
                  type="text" 
                  placeholder="e.g. +919876543210" 
                  value={whatsappSettings.phone || ''} 
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phone: e.target.value })}
                  required={whatsappSettings.enabled}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>CallMeBot API Key</label>
                <input 
                  type="password" 
                  placeholder="Enter API Key from WhatsApp" 
                  value={whatsappSettings.apiKey || ''} 
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, apiKey: e.target.value })}
                  required={whatsappSettings.enabled}
                />
              </div>

              <button type="submit" disabled={savingWhatsapp} className="primary-btn" style={{ width: '100%', padding: '12px' }}>
                {savingWhatsapp ? 'Saving Settings...' : 'Save WhatsApp Settings'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="admin-content full-width">
          <h3>Visitor Analytics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>Today</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{visitorStats.today}</p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>Yesterday</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{visitorStats.yesterday}</p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>Last 7 Days</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{visitorStats.week}</p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>This Month</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{visitorStats.month}</p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>This Year</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>{visitorStats.year}</p>
            </div>
            <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h4 style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '10px' }}>Lifetime</h4>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>{visitorStats.lifetime}</p>
            </div>
          </div>
        </div>
      )}

      {conflictCar && (
        <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ maxWidth: '400px', width: '90%', padding: '25px', textAlign: 'center', borderRadius: '12px', background: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ marginBottom: '15px', color: '#ef4444' }}>⚠️ Serial Number Conflict</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>
              This serial number is already assigned to another vehicle in your active fleet list.
            </p>
            <div style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={conflictCar.image} alt={conflictCar.name} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: 0, color: '#1e293b' }}>{conflictCar.name}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Serial No: {conflictCar.serialNo}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setConflictCar(null)} 
              className="primary-btn"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Change Serial Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
};