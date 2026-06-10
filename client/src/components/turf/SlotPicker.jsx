import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const SlotPicker = ({ slots = [], pricePerHour = 0, onSlotsSelected, lockedSlots = [] }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Clear selections when date or slots prop change
  useEffect(() => {
    setSelectedSlots([]);
  }, [slots]);

  // Convert "HH:MM" to minutes for comparison
  const getMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Check if slot is locked by socket
  const isSlotLocked = (slot) => {
    return lockedSlots.some(ls => ls.slotId === `${slot.startTime}-${slot.endTime}`);
  };

  // Group slots: Morning (<12:00), Afternoon (12:00-17:00), Evening (>=17:00)
  const getGroup = (startTime) => {
    const hours = parseInt(startTime.split(':')[0], 10);
    if (hours < 12) return 'morning';
    if (hours < 17) return 'afternoon';
    return 'evening';
  };

  const groupedSlots = {
    morning: slots.filter(s => getGroup(s.startTime) === 'morning'),
    afternoon: slots.filter(s => getGroup(s.startTime) === 'afternoon'),
    evening: slots.filter(s => getGroup(s.startTime) === 'evening'),
  };

  // Check if two slots are consecutive
  const areConsecutive = (slotA, slotB) => {
    return slotA.endTime === slotB.startTime || slotB.endTime === slotA.startTime;
  };

  const handleSlotClick = (slot) => {
    // If booked or locked, ignore
    if (slot.isBooked || isSlotLocked(slot)) return;

    const slotId = `${slot.date}_${slot.startTime}_${slot.endTime}`;

    setSelectedSlots(prev => {
      // 1. If slot is already selected, deselect it (only if it is on the boundary of selection to preserve consecutiveness)
      const isAlreadySelected = prev.some(s => `${s.date}_${s.startTime}_${s.endTime}` === slotId);
      
      if (isAlreadySelected) {
        if (prev.length === 1) return [];

        // Sort selected slots by time
        const sorted = [...prev].sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        // Only allow deselecting the first or last slot of the range
        if (slot.startTime === first.startTime) {
          const updated = sorted.slice(1);
          triggerCallback(updated);
          return updated;
        }
        if (slot.startTime === last.startTime) {
          const updated = sorted.slice(0, -1);
          triggerCallback(updated);
          return updated;
        }

        // Clicking in the middle resets selection to just this clicked slot
        triggerCallback([slot]);
        return [slot];
      }

      // 2. If no slots are selected, select it
      if (prev.length === 0) {
        triggerCallback([slot]);
        return [slot];
      }

      // 3. Check if clicked slot is consecutive to current selection boundaries
      const sorted = [...prev].sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));
      const firstSelected = sorted[0];
      const lastSelected = sorted[sorted.length - 1];

      if (slot.endTime === firstSelected.startTime) {
        const updated = [slot, ...sorted];
        triggerCallback(updated);
        return updated;
      }

      if (slot.startTime === lastSelected.endTime) {
        const updated = [...sorted, slot];
        triggerCallback(updated);
        return updated;
      }

      // Otherwise, start a new selection with this slot
      triggerCallback([slot]);
      return [slot];
    });
  };

  const triggerCallback = (selected) => {
    if (onSlotsSelected) {
      onSlotsSelected(selected);
    }
  };

  const calculateTotalTime = () => {
    return selectedSlots.length; // assumes 1 hour per slot
  };

  const calculateTotalPrice = () => {
    return calculateTotalTime() * pricePerHour;
  };

  const renderSlotButton = (slot) => {
    const isSelected = selectedSlots.some(s => s.startTime === slot.startTime);
    const locked = isSlotLocked(slot);
    const booked = slot.isBooked;

    let btnClasses = "w-full py-4 text-center rounded-xl font-bold font-inter text-[14px] transition-all border ";
    let content = `${slot.startTime} - ${slot.endTime}`;

    if (booked) {
      btnClasses += "bg-[#edeeef] text-black/30 line-through border-transparent cursor-not-allowed";
    } else if (locked) {
      btnClasses += "bg-[#FFD700] text-[#1A1A1A] border-transparent animate-pulse cursor-not-allowed";
      content = "Being booked...";
    } else if (isSelected) {
      btnClasses += "bg-[#AAEE00] text-[#1A1A1A] border-transparent shadow-md";
    } else {
      btnClasses += "bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#AAEE00] hover:border-transparent";
    }

    return (
      <button
        key={slot.startTime}
        type="button"
        disabled={booked || locked}
        onClick={() => handleSlotClick(slot)}
        className={btnClasses}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Live availability indicator */}
      <div className="flex justify-between items-center bg-[#1A1A1A] text-white p-4 rounded-xl">
        <span className="font-inter font-bold text-[14px] uppercase tracking-wider">Select Time Slots</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute"></span>
          <span className="text-[12px] font-bold text-emerald-400">Live availability</span>
        </div>
      </div>

      {/* Slots groups */}
      <div className="space-y-6">
        {/* Morning Slots */}
        {groupedSlots.morning.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold text-[#5f5e5e] uppercase tracking-widest">Morning (Before 12:00 PM)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {groupedSlots.morning.map(renderSlotButton)}
            </div>
          </div>
        )}

        {/* Afternoon Slots */}
        {groupedSlots.afternoon.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold text-[#5f5e5e] uppercase tracking-widest">Afternoon (12:00 PM - 05:00 PM)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {groupedSlots.afternoon.map(renderSlotButton)}
            </div>
          </div>
        )}

        {/* Evening Slots */}
        {groupedSlots.evening.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold text-[#5f5e5e] uppercase tracking-widest">Evening (After 05:00 PM)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {groupedSlots.evening.map(renderSlotButton)}
            </div>
          </div>
        )}
      </div>

      {/* Summary Box */}
      {selectedSlots.length > 0 && (
        <div className="bg-[#1A1A1A] p-6 rounded-xl text-white space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <p className="text-[14px] text-white/60">Selected Duration</p>
              <p className="text-[18px] font-bold text-[#AAEE00]">{calculateTotalTime()} Hour{calculateTotalTime() > 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] text-white/60">Rate per hour</p>
              <p className="text-[18px] font-bold">₹{pricePerHour}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[16px] font-bold">Total Price</p>
            <p className="text-[24px] font-extrabold text-[#AAEE00]">₹{calculateTotalPrice()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
