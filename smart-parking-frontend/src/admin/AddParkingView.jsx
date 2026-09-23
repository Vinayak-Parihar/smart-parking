import { useState } from 'react';
import LocationPickerModal from './LocationPickerModal';

function AddParkingView({ parkings, onSubmit, isSaving }) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [vehicleType, setVehicleType] = useState('both');
  const [position, setPosition] = useState(null);
  const [formError, setFormError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const capacityNumber = Number(capacity);
    if (!name.trim()) {
      setFormError('Parking name is required.');
      return;
    }
    if (!Number.isInteger(capacityNumber) || capacityNumber <= 0) {
      setFormError('Capacity must be a positive whole number.');
      return;
    }
    if (!position) {
      setFormError('Choose the parking location on the map.');
      return;
    }

    setFormError('');
    const ok = await onSubmit({
      name: name.trim(),
      capacity: capacityNumber,
      vehicleType,
      lat: position.lat,
      lng: position.lng
    });

    if (ok) {
      setName('');
      setCapacity('');
      setVehicleType('both');
      setPosition(null);
    }
  };

  return (
    <div className="add-parking-view">
      <h2>Add Parking</h2>

      <form className="parking-form parking-form--page" onSubmit={handleSubmit}>
        <label>
          Parking name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MG Road Basement Parking"
          />
        </label>

        <label>
          Capacity (total spots)
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 50"
          />
        </label>

        <label>
          Vehicle type supported
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option value="2-wheeler">2-Wheeler</option>
            <option value="4-wheeler">4-Wheeler</option>
            <option value="both">Both</option>
          </select>
        </label>

        <label>
          Location
          <button
            type="button"
            className="location-picker-trigger"
            onClick={() => setPickerOpen(true)}
          >
            {position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'Choose location on map'}
          </button>
        </label>

        {formError && <p className="parking-form-error">{formError}</p>}

        <div className="scan-buttons">
          <button type="submit" className="btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Parking'}
          </button>
        </div>
      </form>

      {pickerOpen && (
        <LocationPickerModal
          parkings={parkings}
          initialPosition={position}
          onConfirm={(pos) => {
            setPosition(pos);
            setPickerOpen(false);
          }}
          onCancel={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

export default AddParkingView;
