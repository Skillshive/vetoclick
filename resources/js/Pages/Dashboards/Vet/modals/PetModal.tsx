import React, { useState,Fragment  } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    PawPrint, 
    Plus, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    History 
} from 'lucide-react';
import { Appointment } from "@/pages/Appointments/datatable/types"; // Ensure this path is correct
import "./main.css";
// --- Helper Component for Pet/Client Details ---
const DetailItem = ({ label, value, className = '' }: { label: string, value: string, className?: string }) => (
    <div className={`${className}`}>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900">{value}</dd>
    </div>
);

// --- Dummy Tab Content Components (No changes needed) ---
const RecentConsultations = () => (
    <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">Consultation History</h4>
            <button className="flex items-center gap-1.5 text-sm bg-primary-600 text-white py-1.5 px-3 rounded-md hover:bg-primary-700 transition">
                <Plus size={16} /> New Entry
            </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason for Visit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veterinarian</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">09/20/2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Annual Wellness Visit</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Dr. Ira Goudut D.V.M.</td>
                </tr>
                {/* ... other rows ... */}
            </tbody>
        </table>
    </div>
);

const Vaccinations = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
                <h4 className="text-lg font-semibold text-gray-800">Core Vaccines</h4>
                <button className="p-1 text-gray-400 hover:text-gray-700"><Plus size={18} /></button>
            </div>
            <ul className="divide-y divide-gray-200 p-4">
                 <li className="flex justify-between items-center py-2">
                    <div>
                        <p className="text-sm font-medium text-gray-900">DHPP 1 yr Vaccination</p>
                        <p className="text-xs text-gray-500">Expires: 12/17/2024</p>
                    </div>
                    <span className="flex items-center text-xs font-medium text-green-700">
                        <CheckCircle size={14} className="mr-1" /> Active
                    </span>
                </li>
                {/* ... other list items ... */}
                 <li className="flex justify-between items-center py-2">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Bordetella Vaccination - Oral</p>
                        <p className="text-xs text-gray-500">Expires: 06/09/2024</p>
                    </div>
                    <span className="flex items-center text-xs font-medium text-red-600">
                        <AlertCircle size={14} className="mr-1" /> Overdue
                    </span>
                </li>
            </ul>
        </div>
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
                <h4 className="text-lg font-semibold text-gray-800">Reminders</h4>
                <button className="p-1 text-gray-400 hover:text-gray-700"><Plus size={18} /></button>
            </div>
            <ul className="divide-y divide-gray-200 p-4">
                <li className="flex justify-between items-center py-2">
                    <p className="text-sm font-medium text-gray-900">Proheart Injection</p>
                    <p className="text-sm text-gray-500">12/17/2024</p>
                </li>
                {/* ... other list items ... */}
            </ul>
        </div>
    </div>
);

const Notes = () => (
    <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center text-sm border-b pb-2 mb-2">
                <p className="text-gray-800 font-medium">Dr. Ira Goudut D.V.M.</p>
                <p className="text-gray-500">09/20/2023 - Wellness Visit</p>
            </div>
            <p className="text-sm text-gray-700">
                Bamboo is in excellent health. Continued with Proheart and DHPP. Client advised to monitor diet, no table scraps. 
                Weight is stable. All vitals normal. Rabies 3yr given.
            </p>
        </div>
        {/* ... other notes ... */}
    </div>
);
interface PetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment;
}

// --- The Main Modal Component ---

const PetDetailModal: React.FC<PetDetailModalProps> = ({ isOpen, onClose, appointment }) => {
    const [activeTab, setActiveTab] = useState('consultations');

    const { pet, client } = appointment;

    console.log("appointment",appointment);
    
    const petImage = appointment.pet.avatar || "https://images.unsplash.com/photo-1583512603805-3d6b6e582a24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D&auto=format&fit=crop&w=200&q=80"; // Fallback image

    const tabs = [
        { id: 'consultations', label: 'Recent Consultations', icon: History },
        { id: 'vaccinations', label: 'Vaccinations', icon: CheckCircle },
        { id: 'notes', label: 'Notes', icon: FileText },
    ];

    return (
     <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
                </TransitionChild>

                {/* Drawer Slide In */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out transform-gpu transition-transform duration-300"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="ease-in transform-gpu transition-transform duration-300"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                >
                    <DialogPanel className="fixed right-0 top-0 flex h-full w-full max-w-5xl transform-gpu flex-col bg-white transition-transform duration-300 dark:bg-dark-700 shadow-2xl">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500 flex-shrink-0">
                            <DialogTitle as="div" className="flex items-center gap-3">
                                <div className="flex-shrink-0 bg-primary-100 text-primary-600 rounded-full p-2 dark:bg-primary-900/30 dark:text-primary-400">
                                    <PawPrint size={20} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-50">
                                    Pet Record
                                </h2>
                            </DialogTitle>
                            <button 
                                onClick={onClose} 
                                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-600 dark:hover:text-dark-200 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto">
                            
                            {/* Pet + Client Info Section */}
                            <div className="grid grid-cols-2 gap-6 p-6 border-b border-gray-200 dark:border-dark-500">
                                {/* Pet Info */}
                                <div className="flex items-start gap-4">
                                    <img 
                                        src={petImage} 
                                        alt={pet.name} 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-dark-500 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-50">{pet.name}</h3>
                                        <span className="text-xs text-gray-500 dark:text-dark-300 font-mono">ID: {pet.microchip}</span>
                                        <dl className="mt-3 grid grid-cols-2 gap-3">
                                            <DetailItem label="Species" value={pet.species} />
                                            <DetailItem label="Breed" value={pet.breed} />
                                            <DetailItem label="Gender" value={pet.gender} />
                                            <DetailItem label="DOB" value={pet.dob.toLocaleDateString()} />
                                            <DetailItem label="Weight" value={`${pet.wieght} kg`} />
                                        </dl>
                                    </div>
                                </div>
                                
                                {/* Client Info */}
                             <div className="client-info-card">
        <div className="client-info-item">
            <User size={18} />
            <span>{client.first_name} {client.last_name}</span>
        </div>
        <div className="client-info-item">
            <Phone size={18} />
            <span>(123) 456-7890</span>
        </div>
        <div className="client-info-item">
            <Mail size={18} />
            <span>{client.first_name.toLowerCase()}@emaildomain.com</span>
        </div>
        <div className="client-info-item">
            <MapPin size={18} />
            <span>1234 Main St, San Luis Obispo, CA 93401</span>
        </div>
    </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 dark:border-dark-500 px-6 bg-white dark:bg-dark-700 sticky top-0 z-10">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 transition-colors
                                                text-sm font-medium
                                                ${activeTab === tab.id
                                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                    : 'border-transparent text-gray-500 dark:text-dark-300 hover:text-gray-700 dark:hover:text-dark-100 hover:border-gray-300 dark:hover:border-dark-400'
                                                }
                                            `}
                                        >
                                            <tab.icon size={16} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 bg-gray-50/70 dark:bg-dark-600/50">
                                {activeTab === 'consultations' && <RecentConsultations />}
                                {activeTab === 'vaccinations' && <Vaccinations />}
                                {activeTab === 'notes' && <Notes />}
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
};
export default PetDetailModal;