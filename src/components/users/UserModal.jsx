import React, { useState, useEffect } from 'react';
import { User, Tag, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { usePortfolio } from '../../context/PortfolioContext';
import { validateUserId, validateUserName, MAX_USERS_LIMIT } from '../../utils/validation';

export function UserModal() {
  const {
    addUserModalOpen,
    setAddUserModalOpen,
    editUserModal,
    setEditUserModal,
    addUser,
    editUserName,
    users,
  } = usePortfolio();

  const isEditing = editUserModal.isOpen;
  const isOpen = addUserModalOpen || isEditing;

  // Form fields strictly start empty with no prefilled personal info
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && editUserModal.user) {
      setUserId(editUserModal.user.userID);
      setUserName(editUserModal.user.name);
      setErrors({});
    } else if (addUserModalOpen) {
      setUserId('');
      setUserName('');
      setErrors({});
    }
  }, [isEditing, editUserModal.user, addUserModalOpen]);

  const handleClose = () => {
    if (isEditing) {
      setEditUserModal({ isOpen: false, user: null });
    } else {
      setAddUserModalOpen(false);
    }
    setUserId('');
    setUserName('');
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!isEditing) {
      const idVal = validateUserId(userId, users);
      if (!idVal.valid) {
        newErrors.userId = idVal.error;
      }
    }

    const nameVal = validateUserName(userName);
    if (!nameVal.valid) {
      newErrors.userName = nameVal.error;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      editUserName(userId, userName);
    } else {
      addUser(userId, userName);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit User Details' : 'Register New User'}
      subtitle={
        isEditing
          ? `Editing name for User ID: ${userId}`
          : `Create a new investor profile (Max ${MAX_USERS_LIMIT} users)`
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User ID */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
            User ID <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Tag className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={userId}
              disabled={isEditing}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }));
              }}
              placeholder="Enter your unique ID"
              className={`cosmic-input pl-10 font-mono ${
                isEditing ? 'opacity-60 cursor-not-allowed bg-black/60' : ''
              } ${errors.userId ? 'border-rose-500' : ''}`}
              autoFocus={!isEditing}
            />
          </div>
          {errors.userId && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.userId}
            </p>
          )}
          {!isEditing && (
            <p className="mt-1 text-[11px] text-slate-500">
              Unique identifier. Letters, numbers, hyphens, and underscores supported.
            </p>
          )}
        </div>

        {/* User Name */}
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-widest mb-1.5">
            Full Name <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errors.userName) setErrors((prev) => ({ ...prev, userName: null }));
              }}
              placeholder="Enter your name"
              className={`cosmic-input pl-10 ${
                errors.userName ? 'border-rose-500' : ''
              }`}
              autoFocus={isEditing}
            />
          </div>
          {errors.userName && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {errors.userName}
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-500">
            Supports names with spaces.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleClose}
            className="pill-btn-secondary !text-xs !py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="pill-btn-neon !text-xs !py-2"
          >
            {isEditing ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
