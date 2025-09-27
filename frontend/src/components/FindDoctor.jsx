import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { FaSearch, FaUserMd, FaEnvelope } from 'react-icons/fa';

const FindDoctor = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('http://localhost:5000/api/chat/doctors/verified');
            if (searchQuery) {
                url.searchParams.append('search', searchQuery);
            }
            if (selectedSpecialization) {
                url.searchParams.append('specialization', selectedSpecialization);
            }

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to fetch doctors.');
            }

            const data = await res.json();
            setDoctors(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [searchQuery, selectedSpecialization]);

    const handleStartChat = async (recipientId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/chat/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ recipientId })
            });

            const data = await res.json();
            if (res.ok) {
                navigate(`/chat?conversationId=${data.data._id}`);
            } else {
                throw new Error(data.message || 'Failed to start conversation.');
            }
        } catch (err) {
            console.error('Error starting conversation:', err);
            setError(err.message);
        }
    };

    // Assuming a list of common specializations for the filter dropdown
    const specializations = [
        'Cardiology',
        'Dermatology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Psychiatry',
        'General Medicine'
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Find a Doctor</h1>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search by doctor's name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative w-full md:w-1/3">
                        <select
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                        <FaUserMd className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading doctors...</span>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {!loading && !error && doctors.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No doctors found. Try adjusting your search or filters.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doctor => (
                        <div key={doctor._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mr-4">
                                    {doctor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
                                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">
                                Role: <span className="font-semibold">{doctor.role}</span>
                            </p>
                            <button
                                onClick={() => handleStartChat(doctor._id)}
                                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <FaEnvelope className="mr-2" /> Start Chat
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FindDoctor;
