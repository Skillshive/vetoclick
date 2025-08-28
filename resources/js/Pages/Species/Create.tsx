import React from 'react';
import { useForm } from '@inertiajs/react';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { Page } from '@/components/shared/Page';
import MainLayout from '@/layouts/MainLayout';
import { SpeciesCreatePageProps, SpeciesFormData } from '@/types/Species';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Create({ errors }: SpeciesCreatePageProps) {
    const { data, setData, post, processing, reset } = useForm<SpeciesFormData>({
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('species.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <MainLayout>
            <Page title="Créer une nouvelle espèce">
                <div className="max-w-2xl mx-auto">
                    <Card className="p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Nouvelle espèce
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Créez une nouvelle espèce d'animal dans le système
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nom de l'espèce *
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ex: Chien, Chat, Oiseau..."
                                    className={errors?.name ? 'border-red-500' : ''}
                                    required
                                />
                                {errors?.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    value={data.description || ''}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Description de l'espèce (optionnel)"
                                    rows={4}
                                    className={errors?.description ? 'border-red-500' : ''}
                                />
                                {errors?.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {processing ? 'Création...' : 'Créer l\'espèce'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Page>
        </MainLayout>
    );
}
