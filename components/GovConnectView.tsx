
import React, { useState } from 'react';

const AdvisoryCard: React.FC<{ title: string; date: string; content: string }> = ({ title, date, content }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-800">{title}</h3>
            <span className="text-sm text-gray-500">{date}</span>
        </div>
        <p className="text-gray-600">{content}</p>
    </div>
);

export const GovConnectView: React.FC = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [queryType, setQueryType] = useState('Complaint');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Here you would typically send the data to a backend
        console.log({ name, location, queryType, message });
    };

    return (
        <div className="p-6 sm:p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">Submit a Query</h2>
                    <p className="text-md text-gray-600">Raise complaints, request subsidies, or ask for scheme information.</p>
                </header>
                {submitted ? (
                     <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                        <p className="font-bold">Success</p>
                        <p>Your query has been submitted. A government official will respond shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Village/District</label>
                            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                        </div>
                        <div>
                            <label htmlFor="queryType" className="block text-sm font-medium text-gray-700 mb-1">Query Type</label>
                            <select id="queryType" value={queryType} onChange={(e) => setQueryType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500">
                                <option>Complaint</option>
                                <option>Subsidy Request</option>
                                <option>Scheme Information</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300">Submit Query</button>
                    </form>
                )}
            </div>
            <div>
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-1">Government Advisories</h2>
                    <p className="text-md text-gray-600">Latest updates and alerts from agricultural authorities.</p>
                </header>
                <div className="space-y-4">
                    <AdvisoryCard 
                        title="New Subsidy on Drip Irrigation Systems"
                        date="2 days ago"
                        content="Farmers can now avail a 75% subsidy on new drip irrigation system installations. Apply through the portal."
                    />
                    <AdvisoryCard 
                        title="Pest Alert: Locust Swarm Warning"
                        date="1 week ago"
                        content="Locust swarms have been reported in the western districts. Farmers are advised to take preventive measures immediately."
                    />
                     <AdvisoryCard 
                        title="Weather Update: Heavy Rainfall Expected"
                        date="3 hours ago"
                        content="Heavy rainfall is predicted for the next 48 hours. Please take necessary precautions to protect your crops and livestock."
                    />
                </div>
            </div>
        </div>
    );
};
