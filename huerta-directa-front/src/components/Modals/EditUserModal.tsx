import React from "react";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "../GlobalComponents/Modal";
import { Button } from "../GlobalComponents/Button";

interface UserInfo {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  registrationDate: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo | null;
  onSave?: (updatedUser: any) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    role: "",
    status: "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleUpdate = () => {
    if (onSave) onSave({ ...user, ...formData });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
      icon={faPen}
    >
      <div className="flex flex-col gap-6 p-6">
        <p className="text-gray-500 italic border-l-4 border-[#004d00] pl-4">
          Editando perfil de: <b className="text-[#004d00]">{user?.fullName}</b>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#004d00] outline-none transition-all font-medium"
            />
          </div>
          <div className="form-group flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#004d00] outline-none transition-all font-medium"
            />
          </div>
          <div className="form-group flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Rol de Usuario
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#004d00] outline-none transition-all font-bold text-[#004d00] appearance-none cursor-pointer"
            >
              <option value="Cliente">Cliente Estándar</option>
              <option value="Productor">Productor Agrícola</option>
              <option value="Administrador">Administrador del Sistema</option>
            </select>
          </div>
          <div className="form-group flex flex-col gap-2">
            <label className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Estado de Cuenta
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#004d00] outline-none transition-all font-bold appearance-none cursor-pointer"
            >
              <option value="Active">Activo ✓</option>
              <option value="Inactive">Inactivo ✗</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            text="Cancelar"
            className="bg-[#004d00] text-white rounded-2xl py-4 flex-1 font-bold hover:bg-[#004d00]/80 transition-all border-none"
            onClick={onClose}
          />
          <Button
            text="Actualizar Usuario"
            className="bg-[#004d00] text-white rounded-2xl py-4 flex-2 font-bold shadow-xl shadow-[#004d00]/20 hover:scale-[1.02] transition-all border-none"
            onClick={handleUpdate}
          />
        </div>
      </div>
    </Modal>
  );
};
