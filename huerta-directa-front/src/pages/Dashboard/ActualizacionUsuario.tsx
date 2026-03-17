import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faUser, faEnvelope, faCamera, faLocationDot, faPhone, faCloudArrowUp, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../../components/GlobalComponents/Button";
import { usePageTitle } from "../../hooks/usePageTitle";
import { PasswordInput } from "../../components/GlobalComponents/PasswordInput";
import authService from "../../services/authService";
import Swal from "sweetalert2";
import { API_URL } from "../../config/api";

export const ActualizacionUsuario: React.FC = () => {
    usePageTitle("Mi Perfil");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        currentPassword: "",
        newPassword: ""
    });
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const phoneRegex = /^\d{10}$/;
    const addressRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#.,\-_/()]+$/;

    useEffect(() => {
        const loadProfile = async () => {
            const localSessionUser = authService.getCurrentUser();

            if (localSessionUser) {
                setFormData((prev) => ({
                    ...prev,
                    fullName: localSessionUser.name ?? prev.fullName,
                    email: localSessionUser.email ?? prev.email
                }));
                setProfileImageUrl(localSessionUser.profileImageUrl ?? "");
            }

            try {
                const profile = await authService.getProfile();
                setFormData((prev) => ({
                    ...prev,
                    fullName: profile.name ?? prev.fullName,
                    email: profile.email ?? prev.email,
                    phone: profile.phone ?? "",
                    address: profile.address ?? ""
                }));
                setProfileImageUrl(profile.profileImageUrl ?? localSessionUser?.profileImageUrl ?? "");
            } catch (error: any) {
                if (!localSessionUser) {
                    await Swal.fire({
                        icon: "error",
                        title: "No se pudo cargar el perfil",
                        text: error?.message ?? "Intenta de nuevo"
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        void loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "phone") {
            const sanitizedPhone = value.replace(/\D/g, "").slice(0, 10);
            setFormData((prev) => ({ ...prev, phone: sanitizedPhone }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getProfileImageSrc = (imageUrl: string) => {
        if (!imageUrl) return "";
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        return `${API_URL}${imageUrl}`;
    };

    const handleProfilePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            await Swal.fire({
                icon: "warning",
                title: "Archivo inválido",
                text: "Selecciona una imagen válida."
            });
            return;
        }

        setUploadingPhoto(true);

        try {
            const updatedProfile = await authService.uploadProfilePhoto(file);
            const nextImageUrl = updatedProfile.profileImageUrl ?? "";
            setProfileImageUrl(nextImageUrl);

            window.dispatchEvent(new CustomEvent("profile-photo-updated", {
                detail: { profileImageUrl: nextImageUrl }
            }));

            await Swal.fire({
                icon: "success",
                title: "Foto actualizada",
                text: "Tu foto de perfil se guardó correctamente."
            });
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo subir la foto",
                text: error?.message ?? "Intenta de nuevo"
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setUploadingPhoto(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            await Swal.fire({ icon: "warning", title: "Nombre requerido", text: "Ingresa tu nombre completo." });
            return;
        }

        if (!formData.email.trim()) {
            await Swal.fire({ icon: "warning", title: "Correo requerido", text: "Ingresa tu correo electrónico." });
            return;
        }

        if (!phoneRegex.test(formData.phone.trim())) {
            await Swal.fire({
                icon: "warning",
                title: "Número inválido",
                text: "El número debe tener exactamente 10 dígitos y solo números."
            });
            return;
        }

        if (!formData.address.trim()) {
            await Swal.fire({ icon: "warning", title: "Dirección requerida", text: "Ingresa tu dirección." });
            return;
        }

        if (!addressRegex.test(formData.address.trim())) {
            await Swal.fire({
                icon: "warning",
                title: "Dirección inválida",
                text: "La dirección solo permite letras, números y símbolos como # . , - /"
            });
            return;
        }

        setSavingProfile(true);

        try {
            const updatedProfile = await authService.updateProfile({
                name: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim()
            });

            setFormData((prev) => ({
                ...prev,
                fullName: updatedProfile.name ?? prev.fullName,
                email: updatedProfile.email ?? prev.email,
                phone: updatedProfile.phone ?? prev.phone,
                address: updatedProfile.address ?? prev.address
            }));

            await Swal.fire({
                icon: "success",
                title: "Perfil actualizado",
                text: "Tus datos se guardaron correctamente."
            });
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: error?.message ?? "Intenta de nuevo"
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword) {
            await Swal.fire({
                icon: "warning",
                title: "Datos incompletos",
                text: "Ingresa contraseña actual y nueva contraseña."
            });
            return;
        }

        if (formData.newPassword.trim().length < 6) {
            await Swal.fire({
                icon: "warning",
                title: "Contraseña inválida",
                text: "La nueva contraseña debe tener mínimo 6 caracteres."
            });
            return;
        }

        setSavingPassword(true);

        try {
            await authService.changePassword(formData.currentPassword, formData.newPassword);
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: ""
            }));

            await Swal.fire({
                icon: "success",
                title: "Contraseña actualizada",
                text: "Tu contraseña se cambió correctamente."
            });
        } catch (error: any) {
            await Swal.fire({
                icon: "error",
                title: "No se pudo cambiar la contraseña",
                text: error?.message ?? "Intenta de nuevo"
            });
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center py-16">
                <p className="text-gray-500 font-semibold">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-800 text-white flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faGear} size="lg" />
                </div>
                <h1 className="text-3xl font-black text-gray-800 dark:text-white  tracking-tight">Mi Perfil</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
                {/* Profile Card */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300 relative overflow-hidden">
                                {profileImageUrl ? (
                                    <img
                                        src={getProfileImageSrc(profileImageUrl)}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} size="4x" />
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePhotoSelected}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#8dc84b] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all disabled:opacity-60"
                            >
                                <FontAwesomeIcon icon={faCamera} size="sm" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{formData.fullName || "Usuario"}</h3>
                            <p className="text-sm text-[#8dc84b] font-bold  tracking-tight">Activo</p>
                        </div>
                        <div className="w-full pt-4 border-t border-gray-50 text-left flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-gray-500">
                                <FontAwesomeIcon icon={faEnvelope} className="w-4" />
                                <span className="text-sm">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                                <FontAwesomeIcon icon={faPhone} className="w-4" />
                                <span className="text-sm">{formData.phone || "Sin número"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Update Form */}
                <div className="bg-white p-10 rounded-4xl  shadow-sm border border-gray-100 flex flex-col gap-8">
                    <h2 className="text-xl font-black text-gray-800 border-b border-gray-50 pb-4">Actualizar Información</h2>
                    
                    <form className="flex flex-col gap-6" onSubmit={handleProfileSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Nombre Completo</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#8dc84b]/30 transition-all" 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Correo Electrónico</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        readOnly
                                        title="El correo electrónico no se puede editar"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl outline-none cursor-not-allowed" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Teléfono</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        inputMode="numeric"
                                        maxLength={10}
                                        placeholder="3001234567"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#8dc84b]/30 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-bold text-gray-700 uppercase tracking-widest text-[10px]">Dirección</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faLocationDot} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input 
                                        type="text" 
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Calle 10 # 20-35, Apto 4B"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#8dc84b]/30 transition-all" 
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                                type="submit"
                                text={savingProfile ? "Guardando..." : "Guardar Cambios"}
                                disabled={savingProfile}
                                iconLetf={faCloudArrowUp}
                                className="mt-4 bg-[#8dc84b] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#8dc84b]/20"
                        />
                    </form>

                    <form className="flex flex-col gap-2 pt-4 border-t border-gray-50 profile-password-inputs" onSubmit={handlePasswordSubmit}>
                            <h3 className="font-bold text-gray-800 uppercase tracking-widest text-[10px] mb-2">Cambiar Contraseña</h3>
                            <PasswordInput 
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Contraseña actual"
                            />
                            <PasswordInput 
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Nueva contraseña"
                            />
                            <Button
                                type="submit"
                                text={savingPassword ? "Cambiando..." : "Actualizar Contraseña"}
                                disabled={savingPassword}
                                iconLetf={faArrowsRotate}
                                className="mt-4 bg-[#8dc84b] text-white py-4 rounded-2xl font-black"
                            />
                            </form>
        </div>
      </div>
    </div>
  );
};

export default ActualizacionUsuario;
