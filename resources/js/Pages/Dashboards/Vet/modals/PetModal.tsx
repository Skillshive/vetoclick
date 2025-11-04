import React, { useState } from 'react';
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

// --- Helper Component for Pet/Client Details ---
const DetailItem = ({ label, value, className = '' }: { label: string, value: string, className?: string }) => (
    <div className={`py-1.5 ${className}`}>
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
        <Transition show={isOpen}>
          <div className="flex min-h-full items-center justify-center p-4 ">
            <Dialog onClose={onClose} className="relative z-50">
                
                {/* Backdrop */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </TransitionChild>

                {/* Modal Content */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel 
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all max-h-[90vh] flex flex-col m-auto"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <DialogTitle as="div" className="flex items-center gap-3">
                                        <div className="flex-shrink-0 bg-primary-100 text-primary-600 rounded-full p-2">
                                            <PawPrint size={20} />
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Pet Record: {pet.name}
                                        </h2>
                                    </DialogTitle>
                                    <button 
                                        onClick={onClose} 
                                        className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* --- Top Section: Pet + Client Info --- */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 p-6 border-b border-gray-200">
                                    {/* Left Col: Pet Info */}
                                    <div className="flex items-start gap-4">
                                        <img 
                                            src={petImage} 
                                            alt={pet.name} 
                                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                                        />
                                        <div>
                                            <h3 className="text-3xl font-bold text-gray-900">{pet.name}</h3>
                                            <span className="text-sm text-gray-500 font-mono">ID: {pet.microchip}</span>
                                            <dl className="mt-2 grid grid-cols-2 gap-x-4">
                                                <DetailItem label="Species" value={pet.species} />
                                                <DetailItem label="Breed" value={pet.breed} />
                                                <DetailItem label="Gender" value={pet.gender} />
                                                <DetailItem label="DOB" value={pet.dob.toLocaleDateString()} />
                                                <DetailItem label="Weight" value={`${pet.wieght} kg`} />
                                            </dl>
                                        </div>
                                    </div>
                                    
                                    {/* Right Col: Client Info */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 md:mt-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-shrink-0 bg-gray-200 text-gray-700 rounded-full p-2">
                                                <User size={18} />
                                            </div>
                                            <h4 className="text-xl font-semibold text-gray-900">
                                                {client.first_name} {client.last_name}
                                            </h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2.5 text-gray-700">
                                                <Phone size={14} className="flex-shrink-0" />
                                                <span>(123) 456-7890</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-gray-700">
                                                <Mail size={14} className="flex-shrink-0" />
                                                <span>{client.first_name.toLowerCase()}@emaildomain.com</span>
                                            </div>
                                            <div className="flex items-start gap-2.5 text-gray-700">
                                                <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                                                <span>1234 Main St, San Luis Obispo, CA 93401</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Bottom Section: Tabs --- */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Tab Headers */}
                                    <div className="border-b border-gray-200 px-6">
                                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`
                                                        flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2
                                                        text-sm font-medium
                                                        ${activeTab === tab.id
                                                            ? 'border-primary-500 text-primary-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                                    <div className="p-6 bg-gray-50/70">
                                        {activeTab === 'consultations' && <RecentConsultations />}
                                        {activeTab === 'vaccinations' && <Vaccinations />}
                                        {activeTab === 'notes' && <Notes />}
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
            </div>
        </Transition>
    );
};
export default PetDetailModal;