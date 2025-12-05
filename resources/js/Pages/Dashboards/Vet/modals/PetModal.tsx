import React, { useState, Fragment, useEffect } from 'react';
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
    History,
    Edit2,
    Trash2,
    Pill,
    AlertTriangle
} from 'lucide-react';
import { Appointment } from "@/pages/Appointments/datatable/types"; // Ensure this path is correct
import "./main.css";
import { useTranslation } from '@/hooks/useTranslation';
import { Spinner, Button, Badge, Input } from '@/components/ui';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { DatePicker } from '@/components/shared/form/Datepicker';
import ReactSelect from '@/components/ui/ReactSelect';
import { router } from '@inertiajs/react';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { vaccinationSchema } from '@/schemas/vaccinationSchema';

type TranslateFn = (key: string, replacements?: Record<string, string | number>) => string;

interface MedicalHistoryData {
    consultations: any[];
    vaccinations: any[];
    notes: any[];
    allergies: any[];
    prescriptions: any[];
}

// --- Helper Component for Pet/Client Details ---
const DetailItem = ({ label, value, className = '' }: { label: string, value: string, className?: string }) => (
    <div className={`${className}`}>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900">{value}</dd>
    </div>
);

// --- Updated Tab Content Components with real data ---
const RecentConsultations = ({ consultations, loading, t }: { consultations?: any[], loading: boolean, t: TranslateFn }) => (
    <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">{t('common.vet_dashboard.pet_modal.consultation_history')}</h4>
        </div>
        {loading ? (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        ) : !consultations || consultations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
                {t('common.no_consultations_found') || 'No consultations found'}
            </div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.reason_for_visit')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.vet_dashboard.pet_modal.veterinarian')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.map((consultation, index) => (
                        <tr key={consultation.uuid || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {new Date(consultation.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {consultation.reason || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {consultation.veterinarian}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

const Vaccinations = ({ 
    vaccinations, 
    loading, 
    t, 
    onAdd, 
    showForm, 
    onToggleForm,
    vaccines = [],
    vaccinationForm,
    setVaccinationForm,
    savingVaccination
}: { 
    vaccinations?: any[], 
    loading: boolean, 
    t: TranslateFn, 
    onAdd?: () => void,
    showForm?: boolean,
    onToggleForm?: () => void,
    vaccines?: any[],
    vaccinationForm?: any,
    setVaccinationForm?: any,
    savingVaccination?: boolean
}) => (
    <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-4 border-b">
                <h4 className="text-lg font-semibold text-gray-800">{t('common.vet_dashboard.pet_modal.core_vaccines')}</h4>
                {onToggleForm && (
                    <button 
                        onClick={onToggleForm}
                        className="flex items-center gap-1.5 text-sm bg-primary-600 text-white py-1.5 px-3 rounded-md hover:bg-primary-700 transition"
                    >
                        {showForm ? <XMarkIcon className="w-4 h-4" /> : <Plus size={16} />}
                        {showForm ? t('common.cancel') : t('common.add_vaccination')}
                    </button>
                )}
            </div>
            
            {/* Add Vaccination Form */}
            {showForm && (
                <div className="p-4 bg-gray-50 dark:bg-dark-600 border-b border-gray-200 dark:border-dark-500">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('common.add_vaccination')}</h5>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="vaccine_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t('common.vaccine')}
                                <span className="text-red-500 mx-1">*</span>
                            </label>
                                <ReactSelect
                                    id="vaccine_id"
                                    value={
                                        vaccinationForm.vaccine_id
                                            ? {
                                                value: vaccinationForm.vaccine_id,
                                                label: vaccines.find((v: any) => v.id === parseInt(vaccinationForm.vaccine_id))?.full_name || ''
                                            }
                                            : null
                                    }
                                    onChange={(option: any) => {
                                        if (option && !Array.isArray(option)) {
                                            setVaccinationForm((prev: any) => ({ ...prev, vaccine_id: option.value }));
                                        } else {
                                            setVaccinationForm((prev: any) => ({ ...prev, vaccine_id: '' }));
                                        }
                                    }}
                                options={vaccines
                                    .filter(v => v && v.id && v.full_name)
                                    .map(v => ({
                                        value: v.id.toString(),
                                        label: v.full_name
                                    }))}
                                placeholder={t('common.select_vaccine')}
                                isRequired={true}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <DatePicker
                                    value={vaccinationForm.vaccination_date}
                                    onChange={(dates: Date[]) => {
                                        if (dates && dates.length > 0) {
                                            const date = dates[0];
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setVaccinationForm((prev: any) => ({ ...prev, vaccination_date: `${year}-${month}-${day}` }));
                                        } else {
                                            setVaccinationForm((prev: any) => ({ ...prev, vaccination_date: '' }));
                                        }
                                    }}
                                    placeholder={t('common.vaccination_date')}
                                    className="rounded-xl"
                                    hasCalenderIcon={true}
                                    options={{
                                        dateFormat: 'Y-m-d',
                                    }}
                                />
                            </div>
                            <div>
                                <DatePicker
                                    value={vaccinationForm.next_due_date}
                                    onChange={(dates: Date[]) => {
                                        if (dates && dates.length > 0) {
                                            const date = dates[0];
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setVaccinationForm((prev: any) => ({ ...prev, next_due_date: `${year}-${month}-${day}` }));
                                        } else {
                                            setVaccinationForm((prev: any) => ({ ...prev, next_due_date: '' }));
                                        }
                                    }}
                                    placeholder={t('common.next_due_date')}
                                    className="rounded-xl"
                                    hasCalenderIcon={true}
                                    options={{
                                        dateFormat: 'Y-m-d',
                                        minDate: new Date(),
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outlined" onClick={onToggleForm} disabled={savingVaccination}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="primary" onClick={onAdd} disabled={savingVaccination}>
                                {savingVaccination ? <Spinner /> : t('common.save')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center p-8">
                    <Spinner />
                </div>
            ) : !vaccinations || vaccinations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    {t('common.no_vaccinations_found') || 'No vaccinations found'}
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 p-4">
                    {vaccinations.map((vaccination, index) => (
                        <li key={vaccination.uuid || index} className="flex justify-between items-center py-2">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{vaccination.vaccine_name}</p>
                                <p className="text-xs text-gray-500">
                                    {t('common.vet_dashboard.pet_modal.next_due_date', { 
                                        date: vaccination.next_due_date ? new Date(vaccination.next_due_date).toLocaleDateString() : 'N/A' 
                                    })}
                                </p>
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-medium ${
                                vaccination.status === 'overdue' ? 'text-red-600' : 'text-green-700'
                            }`}>
                                {vaccination.status === 'overdue' ? (
                                    <><AlertCircle size={14} /> {t('common.vet_dashboard.pet_modal.status.overdue')}</>
                                ) : (
                                    <><CheckCircle size={14} /> {t('common.vet_dashboard.pet_modal.status.active')}</>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
);

const Notes = ({ 
    notes, 
    loading, 
    t, 
    onAdd,
    showForm,
    onToggleForm,
    noteForm,
    setNoteForm,
    savingNote
}: { 
    notes?: any[], 
    loading: boolean, 
    t: TranslateFn, 
    onAdd?: () => void,
    showForm?: boolean,
    onToggleForm?: () => void,
    noteForm?: any,
    setNoteForm?: any,
    savingNote?: boolean
}) => (
    <div className="space-y-4">
        {onToggleForm && (
            <div className="flex justify-end mb-4">
                <button 
                    onClick={onToggleForm}
                    className="flex items-center gap-1.5 text-sm bg-primary-600 text-white py-1.5 px-3 rounded-md hover:bg-primary-700 transition"
                >
                    {showForm ? <XMarkIcon className="w-4 h-4" /> : <Plus size={16} />}
                    {showForm ? t('common.cancel') : t('common.add_note')}
                </button>
            </div>
        )}
        
        {/* Add Note Form */}
        {showForm && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h5 className="font-medium text-gray-900 mb-3">{t('common.add_note')}</h5>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="note_date" className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('common.visit_date')}
                            <span className="text-red-500 mx-1">*</span>
                        </label>
                        <DatePicker
                            value={noteForm.date}
                            onChange={(dates: Date[]) => {
                                if (dates && dates.length > 0) {
                                    const date = dates[0];
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    setNoteForm((prev: any) => ({ ...prev, date: `${year}-${month}-${day}` }));
                                } else {
                                    setNoteForm((prev: any) => ({ ...prev, date: '' }));
                                }
                            }}
                            placeholder={t('common.visit_date')}
                            className="rounded-xl"
                            hasCalenderIcon={true}
                            options={{
                                dateFormat: 'Y-m-d',
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="visit_type" className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('common.visit_type')}
                            <span className="text-red-500 mx-1">*</span>
                        </label>
                        <Input
                            id="visit_type"
                            type="text"
                            value={noteForm.visit_type}
                            onChange={(e) => setNoteForm((prev: any) => ({ ...prev, visit_type: e.target.value }))}
                            placeholder="Wellness Visit"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('common.notes')}
                            <span className="text-red-500 mx-1">*</span>
                        </label>
                        <textarea 
                            id="notes"
                            rows={4}
                            value={noteForm.notes}
                            onChange={(e) => setNoteForm((prev: any) => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter consultation notes..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outlined" onClick={onToggleForm} disabled={savingNote}>
                            {t('common.cancel')}
                        </Button>
                        <Button color="primary" onClick={onAdd} disabled={savingNote}>
                            {savingNote ? <Spinner /> : t('common.save')}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        {loading ? (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        ) : !notes || notes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-white rounded-lg border">
                {t('common.no_notes_found') || 'No notes found'}
            </div>
        ) : (
            notes.map((note, index) => (
                <div key={note.uuid || index} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-center text-sm border-b pb-2 mb-2">
                        <p className="text-gray-800 font-medium">{note.veterinarian}</p>
                        <p className="text-gray-500">
                            {new Date(note.date).toLocaleDateString()} - {note.visit_type}
                        </p>
                    </div>
                    <p className="text-sm text-gray-700">{note.notes}</p>
                </div>
            ))
        )}
    </div>
);

const Allergies = ({ 
    allergies, 
    loading, 
    t, 
    onAdd,
    showForm,
    onToggleForm 
}: { 
    allergies?: any[], 
    loading: boolean, 
    t: TranslateFn, 
    onAdd?: () => void,
    showForm?: boolean,
    onToggleForm?: () => void
}) => (
    <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">{t('common.allergies') || 'Allergies'}</h4>
            {onToggleForm && (
                <button 
                    onClick={onToggleForm}
                    className="flex items-center gap-1.5 text-sm bg-primary-600 text-white py-1.5 px-3 rounded-md hover:bg-primary-700 transition"
                >
                    {showForm ? <XMarkIcon className="w-4 h-4" /> : <Plus size={16} />}
                    {showForm ? t('common.cancel') : t('common.add_allergy')}
                </button>
            )}
        </div>
        
        {/* Add Allergy Form */}
        {showForm && (
            <div className="p-4 bg-gray-50 border-b">
                <h5 className="font-medium text-gray-900 mb-3">{t('common.add_allergy')}</h5>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.allergen_type')}
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Select type</option>
                                <option value="Food">{t('common.food')}</option>
                                <option value="Environmental">{t('common.environmental')}</option>
                                <option value="Medication">{t('common.medication_allergy')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.severity_level')}
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                                <option value="">Select severity</option>
                                <option value="Mild">{t('common.mild')}</option>
                                <option value="Moderate">{t('common.moderate')}</option>
                                <option value="Severe">{t('common.severe')}</option>
                                <option value="Life-threatening">{t('common.life_threatening')}</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('common.allergen_detail')}
                        </label>
                        <input 
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Chicken, Pollen, Penicillin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('common.reaction_description')}
                        </label>
                        <textarea 
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Describe the allergic reaction..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outlined" onClick={onToggleForm}>
                            {t('common.cancel')}
                        </Button>
                        <Button color="primary" onClick={onAdd}>
                            {t('common.save')}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        {loading ? (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        ) : !allergies || allergies.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
                {t('common.no_allergies_found') || 'No allergies found'}
            </div>
        ) : (
            <div className="divide-y divide-gray-200">
                {allergies.map((allergy, index) => (
                    <div key={allergy.uuid || index} className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-medium text-gray-900">{allergy.allergen_type}</h5>
                                    {allergy.severity_level && (
                                        <Badge color={
                                            allergy.severity_level === 'Life-threatening' ? 'error' :
                                            allergy.severity_level === 'Severe' ? 'warning' :
                                            'info'
                                        }>
                                            {allergy.severity_level}
                                        </Badge>
                                    )}
                                    {allergy.resolved_status && (
                                        <Badge color="success">{t('common.resolved')}</Badge>
                                    )}
                                </div>
                                {allergy.allergen_detail && (
                                    <p className="text-sm text-gray-600 mt-1">{allergy.allergen_detail}</p>
                                )}
                                {allergy.reaction_description && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        <span className="font-medium">{t('common.reaction')}:</span> {allergy.reaction_description}
                                    </p>
                                )}
                                {allergy.start_date && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {t('common.start_date')}: {new Date(allergy.start_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const Prescriptions = ({ 
    prescriptions, 
    loading, 
    t, 
    onAdd,
    showForm,
    onToggleForm,
    prescriptionForm,
    setPrescriptionForm,
    savingPrescription,
    medications = [],
    useExistingMedication,
    setUseExistingMedication
}: { 
    prescriptions?: any[], 
    loading: boolean, 
    t: TranslateFn, 
    onAdd?: () => void,
    showForm?: boolean,
    onToggleForm?: () => void,
    prescriptionForm?: any,
    setPrescriptionForm?: any,
    savingPrescription?: boolean,
    medications?: any[],
    useExistingMedication?: boolean,
    setUseExistingMedication?: any
}) => (
    <div className="bg-white rounded-lg border shadow-sm">
        <div className="flex justify-between items-center p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-800">{t('common.prescriptions') || 'Prescriptions'}</h4>
            {onToggleForm && (
                <button 
                    onClick={onToggleForm}
                    className="flex items-center gap-1.5 text-sm bg-primary-600 text-white py-1.5 px-3 rounded-md hover:bg-primary-700 transition"
                >
                    {showForm ? <XMarkIcon className="w-4 h-4" /> : <Plus size={16} />}
                    {showForm ? t('common.cancel') : t('common.add_prescription')}
                </button>
            )}
        </div>
        
        {/* Add Prescription Form */}
        {showForm && (
            <div className="p-4 bg-gray-50 dark:bg-dark-600 border-b border-gray-200 dark:border-dark-500">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('common.add_prescription')}</h5>
                <div className="space-y-3">
                    {/* Toggle between existing medication or custom */}
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-500">
                        <input
                            type="checkbox"
                            id="use-existing-medication"
                            checked={useExistingMedication}
                            onChange={(e) => {
                                setUseExistingMedication(e.target.checked);
                                // Clear medication field when switching
                                setPrescriptionForm((prev: any) => ({ 
                                    ...prev, 
                                    medication: '',
                                    product_id: '' 
                                }));
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="use-existing-medication" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            {t('common.select_from_database') || 'Select medication from database'}
                        </label>
                    </div>

                    <div>
                        <label htmlFor="medication" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('common.medication')}
                            <span className="text-red-500 mx-1">*</span>
                        </label>
                        {useExistingMedication ? (
                            <ReactSelect
                                id="medication"
                                value={
                                    prescriptionForm.product_id
                                        ? {
                                            value: prescriptionForm.product_id,
                                            label: medications.find((m: any) => m && m.id === parseInt(prescriptionForm.product_id))?.name || ''
                                        }
                                        : null
                                }
                                onChange={(option: any) => {
                                    if (option && !Array.isArray(option)) {
                                        const selectedMed = medications.find((m: any) => m && m.id === parseInt(option.value));
                                        setPrescriptionForm((prev: any) => ({ 
                                            ...prev, 
                                            product_id: option.value,
                                            medication: selectedMed?.name || ''
                                        }));
                                    } else {
                                        setPrescriptionForm((prev: any) => ({ 
                                            ...prev, 
                                            product_id: '',
                                            medication: '' 
                                        }));
                                    }
                                }}
                                options={medications
                                    .filter(m => m && m.id && m.name)
                                    .map(m => ({
                                        value: m.id.toString(),
                                        label: m.name
                                    }))}
                                placeholder={t('common.select_medication') || 'Select medication'}
                                isRequired={true}
                            />
                        ) : (
                            <Input
                                id="medication"
                                type="text"
                                value={prescriptionForm.medication}
                                onChange={(e) => setPrescriptionForm((prev: any) => ({ ...prev, medication: e.target.value }))}
                                placeholder="Enter medication name"
                                className="w-full"
                            />
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t('common.dosage')}
                                <span className="text-red-500 mx-1">*</span>
                            </label>
                            <Input
                                id="dosage"
                                type="text"
                                value={prescriptionForm.dosage}
                                onChange={(e) => setPrescriptionForm((prev: any) => ({ ...prev, dosage: e.target.value }))}
                                placeholder="10mg"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t('common.frequency')}
                                <span className="text-red-500 mx-1">*</span>
                            </label>
                            <Input
                                id="frequency"
                                type="text"
                                value={prescriptionForm.frequency}
                                onChange={(e) => setPrescriptionForm((prev: any) => ({ ...prev, frequency: e.target.value }))}
                                placeholder="Twice daily"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {t('common.duration')}
                                <span className="text-red-500 mx-1">*</span>
                            </label>
                            <Input
                                id="duration"
                                type="number"
                                value={prescriptionForm.duration}
                                onChange={(e) => setPrescriptionForm((prev: any) => ({ ...prev, duration: e.target.value }))}
                                placeholder="7"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t('common.instructions')}
                        </label>
                        <textarea 
                            id="instructions"
                            rows={2}
                            value={prescriptionForm.instructions}
                            onChange={(e) => setPrescriptionForm((prev: any) => ({ ...prev, instructions: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Special instructions..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outlined" onClick={onToggleForm} disabled={savingPrescription}>
                            {t('common.cancel')}
                        </Button>
                        <Button color="primary" onClick={onAdd} disabled={savingPrescription}>
                            {savingPrescription ? <Spinner /> : t('common.save')}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        {loading ? (
            <div className="flex justify-center items-center p-8">
                <Spinner />
            </div>
        ) : !prescriptions || prescriptions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
                {t('common.no_prescriptions_found') || 'No prescriptions found'}
            </div>
        ) : (
            <div className="divide-y divide-gray-200">
                {prescriptions.map((prescription, index) => (
                    <div key={prescription.uuid || index} className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h5 className="font-medium text-gray-900">
                                    {prescription.medication || prescription.product?.name}
                                </h5>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">{t('common.dosage')}:</span> {prescription.dosage}</p>
                                    <p><span className="font-medium">{t('common.frequency')}:</span> {prescription.frequency}</p>
                                    <p><span className="font-medium">{t('common.duration')}:</span> {prescription.duration} {t('common.days')}</p>
                                    {prescription.instructions && (
                                        <p><span className="font-medium">{t('common.instructions')}:</span> {prescription.instructions}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);
interface PetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment;
    consultationId?: string | null;
}

// --- The Main Modal Component ---

const PetDetailModal: React.FC<PetDetailModalProps> = ({ isOpen, onClose, appointment, consultationId }) => {
    console.log("consultationId",consultationId);
    const [activeTab, setActiveTab] = useState('consultations');
    const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryData>({
        consultations: [],
        vaccinations: [],
        notes: [],
        allergies: [],
        prescriptions: [],
    });
    const [loading, setLoading] = useState(false);
    const [showForms, setShowForms] = useState({
        vaccination: false,
        note: false,
        allergy: false,
        prescription: false,
    });
    const [vaccines, setVaccines] = useState<any[]>([]);
    const [vaccinationForm, setVaccinationForm] = useState({
        vaccine_id: '',
        vaccination_date: '',
        next_due_date: '',
    });
    const [savingVaccination, setSavingVaccination] = useState(false);
    const [noteForm, setNoteForm] = useState({
        date: '',
        visit_type: '',
        notes: '',
    });
    const [savingNote, setSavingNote] = useState(false);
    const [prescriptionForm, setPrescriptionForm] = useState({
        medication: '',
        product_id: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
    });
    const [savingPrescription, setSavingPrescription] = useState(false);
    const [medications, setMedications] = useState<any[]>([]);
    const [useExistingMedication, setUseExistingMedication] = useState(false);
    
    const { t } = useTranslation();
    const { showToast } = useToast();

    const { pet, client } = appointment;

    // Handlers for toggling forms
    const handleToggleVaccinationForm = () => setShowForms(prev => ({ ...prev, vaccination: !prev.vaccination }));
    const handleToggleNoteForm = () => setShowForms(prev => ({ ...prev, note: !prev.note }));
    const handleToggleAllergyForm = () => setShowForms(prev => ({ ...prev, allergy: !prev.allergy }));
    const handleTogglePrescriptionForm = () => setShowForms(prev => ({ ...prev, prescription: !prev.prescription }));
    
    const handleRefreshData = () => {
        if (pet.uuid) {
            console.log('Refreshing medical history...');
            setLoading(true);
            fetch(route('pets.medical-history', { uuid: pet.uuid }))
                .then(response => response.json())
                .then(data => {
                    console.log('Refreshed medical history:', data);
                    console.log('Vaccinations count:', data.vaccinations?.length);
                    setMedicalHistory(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching medical history:', error);
                    setLoading(false);
                });
        }
    };

    // Save vaccination handler
    const handleSaveVaccination = async () => {
        // Validate with Zod
        const result = vaccinationSchema.safeParse(vaccinationForm);
        
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            const firstError = Object.values(errors)[0];
            if (firstError && firstError.length > 0) {
                showToast({ 
                    type: 'error', 
                    message: t(firstError[0]) || t('common.please_fill_required_fields') || 'Please fill required fields', 
                    duration: 3000 
                });
            }
            return;
        }

        setSavingVaccination(true);
        
        try {
            const response = await fetch(route('vaccinations.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    pet_uuid: pet.uuid,
                    consultation_id: consultationId || null,
                    vaccine_id: parseInt(vaccinationForm.vaccine_id),
                    vaccination_date: vaccinationForm.vaccination_date,
                    next_due_date: vaccinationForm.next_due_date || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Add new vaccination to the list immediately (optimistic update)
                if (data.vaccination) {
                    setMedicalHistory(prev => ({
                        ...prev,
                        vaccinations: [data.vaccination, ...(prev.vaccinations || [])]
                    }));
                }
                
                showToast({ 
                    type: 'success', 
                    message: t('common.vaccination_created') || 'Vaccination created successfully', 
                    duration: 3000 
                });
                
                // Reset form and close
                setVaccinationForm({
                    vaccine_id: '',
                    vaccination_date: '',
                    next_due_date: '',
                });
                setShowForms(prev => ({ ...prev, vaccination: false }));
                
                // Refresh data from server to ensure sync
                handleRefreshData();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save vaccination');
            }
        } catch (error: any) {
            showToast({ 
                type: 'error', 
                message: error.message || t('common.failed_to_save') || 'Failed to save', 
                duration: 3000 
            });
        } finally {
            setSavingVaccination(false);
        }
    };
    const handleSaveNote = async () => {
        // Basic validation
        if (!noteForm.date || !noteForm.visit_type || !noteForm.notes) {
            showToast({ 
                type: 'error', 
                message: t('common.please_fill_required_fields') || 'Please fill all required fields', 
                duration: 3000 
            });
            return;
        }

        setSavingNote(true);
        
        try {
            const response = await fetch(route('notes.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    pet_uuid: pet.uuid,
                    consultation_id: consultationId || null,
                    date: noteForm.date,
                    visit_type: noteForm.visit_type,
                    notes: noteForm.notes,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Add new note to the list immediately (optimistic update)
                if (data.note) {
                    setMedicalHistory(prev => ({
                        ...prev,
                        notes: [data.note, ...(prev.notes || [])]
                    }));
                }
                
                showToast({ 
                    type: 'success', 
                    message: t('common.note_created') || 'Note created successfully', 
                    duration: 3000 
                });
                
                // Reset form and close
                setNoteForm({
                    date: '',
                    visit_type: '',
                    notes: '',
                });
                setShowForms(prev => ({ ...prev, note: false }));
                
                // Refresh data from server to ensure sync
                handleRefreshData();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save note');
            }
        } catch (error: any) {
            showToast({ 
                type: 'error', 
                message: error.message || t('common.failed_to_save') || 'Failed to save', 
                duration: 3000 
            });
        } finally {
            setSavingNote(false);
        }
    };
    
    const handleSaveAllergy = () => {
        showToast({ type: 'info', message: 'Allergy save functionality will be implemented', duration: 3000 });
    };
    
    const handleSavePrescription = async () => {
        // Basic validation
        if (!prescriptionForm.medication || !prescriptionForm.dosage || !prescriptionForm.frequency || !prescriptionForm.duration) {
            showToast({ 
                type: 'error', 
                message: t('common.please_fill_required_fields') || 'Please fill all required fields', 
                duration: 3000 
            });
            return;
        }

        setSavingPrescription(true);
        
        try {
            const response = await fetch(route('prescriptions.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    pet_uuid: pet.uuid,
                    consultation_id: consultationId || null,
                    product_id: prescriptionForm.product_id ? parseInt(prescriptionForm.product_id) : null,
                    medication: prescriptionForm.medication,
                    dosage: prescriptionForm.dosage,
                    frequency: prescriptionForm.frequency,
                    duration: parseInt(prescriptionForm.duration),
                    instructions: prescriptionForm.instructions || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                // Add new prescription to the list immediately (optimistic update)
                if (data.prescription) {
                    setMedicalHistory(prev => ({
                        ...prev,
                        prescriptions: [data.prescription, ...(prev.prescriptions || [])]
                    }));
                }
                
                showToast({ 
                    type: 'success', 
                    message: t('common.prescription_created') || 'Prescription created successfully', 
                    duration: 3000 
                });
                
                // Reset form and close
                setPrescriptionForm({
                    medication: '',
                    product_id: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    instructions: '',
                });
                setUseExistingMedication(false);
                setShowForms(prev => ({ ...prev, prescription: false }));
                
                // Refresh data from server to ensure sync
                handleRefreshData();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save prescription');
            }
        } catch (error: any) {
            showToast({ 
                type: 'error', 
                message: error.message || t('common.failed_to_save') || 'Failed to save', 
                duration: 3000 
            });
        } finally {
            setSavingPrescription(false);
        }
    };

    const petImage = appointment.pet.avatar || "https://images.unsplash.com/photo-1583512603805-3d6b6e582a24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%D%D&auto=format&fit=crop&w=200&q=80"; // Fallback image

    const tabs = [
        { id: 'consultations', label: t('common.vet_dashboard.pet_modal.tabs.consultations'), icon: History },
        { id: 'vaccinations', label: t('common.vet_dashboard.pet_modal.tabs.vaccinations'), icon: CheckCircle },
        { id: 'notes', label: t('common.vet_dashboard.pet_modal.tabs.notes'), icon: FileText },
        { id: 'allergies', label: t('common.allergies') || 'Allergies', icon: AlertTriangle },
        { id: 'prescriptions', label: t('common.prescriptions') || 'Prescriptions', icon: Pill },
    ];

    // Fetch medical history when modal opens
    useEffect(() => {
        if (isOpen && pet.uuid) {
            console.log('Fetching medical history for pet:', pet.uuid);
            setLoading(true);
            fetch(route('pets.medical-history', { uuid: pet.uuid }))
                .then(response => response.json())
                .then(data => {
                    console.log('Medical history data received:', data);
                    console.log('Vaccinations:', data.vaccinations);
                    setMedicalHistory(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching medical history:', error);
                    setLoading(false);
                });
        }
    }, [isOpen, pet.uuid]);

    // Fetch vaccine products
    useEffect(() => {
        if (isOpen) {
            fetch(route('vaccine-products.index'))
                .then(response => response.json())
                .then(data => {
                    setVaccines(data.vaccines || []);
                })
                .catch(error => {
                    console.error('Error fetching vaccines:', error);
                });
        }
    }, [isOpen]);

    // Fetch medications/products for prescriptions
    useEffect(() => {
        if (isOpen) {
            fetch('/api/products/all')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data) {
                        setMedications(data.data);
                    } else {
                        setMedications([]);
                    }
                })
                .catch(error => {
                    console.error('Error fetching medications:', error);
                    setMedications([]);
                });
        }
    }, [isOpen]);

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
                                    {t('common.vet_dashboard.pet_modal.pet_record')}
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
                                        <span className="text-xs text-gray-500 dark:text-dark-300 font-mono">{t('common.vet_dashboard.pet_modal.pet_id', { id: pet.microchip })}</span>
                                        <dl className="mt-3 grid grid-cols-2 gap-3">
                                            <DetailItem label={t('common.vet_dashboard.pet_modal.species')} value={pet.species} />
                                            <DetailItem label={t('common.vet_dashboard.pet_modal.breed')} value={pet.breed} />
                                            <DetailItem label={t('common.vet_dashboard.pet_modal.gender')} value={pet.gender} />
                                            <DetailItem label={t('common.vet_dashboard.pet_modal.dob')} value={pet.dob.toLocaleDateString()} />
                                            <DetailItem label={t('common.vet_dashboard.pet_modal.weight')} value={`${pet.wieght} kg`} />
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
            <span>{t('common.vet_dashboard.pet_modal.sample.phone')}</span>
        </div>
        <div className="client-info-item">
            <Mail size={18} />
            <span>{client.first_name.toLowerCase()}@emaildomain.com</span>
        </div>
        <div className="client-info-item">
            <MapPin size={18} />
            <span>{t('common.vet_dashboard.pet_modal.sample.address')}</span>
        </div>
    </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 dark:border-dark-500 px-6 bg-white dark:bg-dark-700 sticky top-0 z-10">
                                <nav className="-mb-px flex gap-6" aria-label="Tabs">
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
                                {activeTab === 'consultations' && (
                                    <RecentConsultations 
                                        consultations={medicalHistory.consultations} 
                                        loading={loading}
                                        t={t} 
                                    />
                                )}
                                {activeTab === 'vaccinations' && (
                                    <Vaccinations 
                                        vaccinations={medicalHistory.vaccinations} 
                                        loading={loading}
                                        t={t}
                                        onAdd={handleSaveVaccination}
                                        showForm={showForms.vaccination}
                                        onToggleForm={handleToggleVaccinationForm}
                                        vaccines={vaccines}
                                        vaccinationForm={vaccinationForm}
                                        setVaccinationForm={setVaccinationForm}
                                        savingVaccination={savingVaccination}
                                    />
                                )}
                                {activeTab === 'notes' && (
                                    <Notes 
                                        notes={medicalHistory.notes} 
                                        loading={loading}
                                        t={t}
                                        onAdd={handleSaveNote}
                                        showForm={showForms.note}
                                        onToggleForm={handleToggleNoteForm}
                                        noteForm={noteForm}
                                        setNoteForm={setNoteForm}
                                        savingNote={savingNote}
                                    />
                                )}
                                {activeTab === 'allergies' && (
                                    <Allergies 
                                        allergies={medicalHistory.allergies} 
                                        loading={loading}
                                        t={t}
                                        onAdd={handleSaveAllergy}
                                        showForm={showForms.allergy}
                                        onToggleForm={handleToggleAllergyForm}
                                    />
                                )}
                                {activeTab === 'prescriptions' && (
                                    <Prescriptions 
                                        prescriptions={medicalHistory.prescriptions} 
                                        loading={loading}
                                        t={t}
                                        onAdd={handleSavePrescription}
                                        showForm={showForms.prescription}
                                        onToggleForm={handleTogglePrescriptionForm}
                                        prescriptionForm={prescriptionForm}
                                        setPrescriptionForm={setPrescriptionForm}
                                        savingPrescription={savingPrescription}
                                        medications={medications}
                                        useExistingMedication={useExistingMedication}
                                        setUseExistingMedication={setUseExistingMedication}
                                    />
                                )}
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
};
export default PetDetailModal;