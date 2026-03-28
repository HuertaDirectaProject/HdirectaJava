import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faMapMarkerAlt, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { usePayment } from "../../hooks/usePayment";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import authService from "../../services/authService";
import { useCart } from "../../contexts/CartContext";
import { API_URL } from "../../config/api";

interface SellerContact {
	producerId: number;
	producerName: string;
}

export const ShippingCard = () => {
	const { shippingMethod, setShippingMethod } = usePayment();
	const { items } = useCart();
	const navigate = useNavigate();
	const [fullName, setFullName] = useState("Usuario");
	const [address, setAddress] = useState("Sin dirección registrada");
	const [contactSellerData, setContactSellerData] = useState<SellerContact | null>(null);

	const shippingOptions = [
		{ id: "standard", name: "Envío Estándar", time: "2-3 días", price: 15000 },
		{ id: "pickup", name: "Tarifa acordada", time: "Inmediato", price: 0 },
	];

	

	const profileRoute = useMemo(() => {
		const currentUser = authService.getCurrentUser();
		return currentUser?.idRole === 1 ? "/admin/perfil" : "/actualizacionUsuario";
	}, []);

	useEffect(() => {
		let cancelled = false;

		const resolveSellerContact = async () => {
			const currentUser = authService.getCurrentUser();

			const withMetadata = items.find(
				(item) => item.producerId && item.producerId !== currentUser?.id,
			);

			if (withMetadata?.producerId) {
				if (!cancelled) {
					setContactSellerData({
						producerId: withMetadata.producerId,
						producerName: withMetadata.producerName ?? "Vendedor",
					});
				}
				return;
			}

			for (const item of items) {
				try {
					const response = await fetch(`${API_URL}/api/products/${item.id}`, {
						credentials: "include",
					});

					if (!response.ok) {
						continue;
					}

					const productData = await response.json();
					const rawProducerId = productData.userId ?? productData.idUser ?? productData.idProducer;
					const producerId = Number(rawProducerId);

					if (!Number.isFinite(producerId) || producerId === currentUser?.id) {
						continue;
					}

					if (!cancelled) {
						setContactSellerData({
							producerId,
							producerName: productData.userName ?? "Vendedor",
						});
					}
					return;
				} catch {
					continue;
				}
			}

			if (!cancelled) {
				setContactSellerData(null);
			}
		};

		void resolveSellerContact();

		return () => {
			cancelled = true;
		};
	}, [items]);

	useEffect(() => {
		const localUser = authService.getCurrentUser();
		if (localUser?.name) {
			setFullName(localUser.name);
		}

		const loadProfile = async () => {
			try {
				const profile = await authService.getProfile();
				setFullName(profile.name || localUser?.name || "Usuario");
				setAddress(profile.address?.trim() ? profile.address : "Sin dirección registrada");
			} catch {
				setAddress("Sin dirección registrada");
			}
		};

		void loadProfile();
	}, []);

	const handleEditAddress = async () => {
		const result = await Swal.fire({
			icon: "info",
			title: "Editar dirección",
			text: "Para cambiar tu dirección debes ir a tu perfil.",
			showCancelButton: true,
			confirmButtonText: "Ir a perfil",
			cancelButtonText: "Cancelar",
			confirmButtonColor: "#8BC34A",
		});

		if (result.isConfirmed) {
			navigate(profileRoute);
		}
	};

	const handleContactSeller = () => {
		if (!contactSellerData) {
			void Swal.fire({
				icon: "info",
				title: "Contacto no disponible",
				text: "No pudimos identificar el usuario que subió este producto.",
				confirmButtonColor: "#8BC34A",
			});
			return;
		}

		navigate(
			`/dashboard/mensajes?userId=${contactSellerData.producerId}&userName=${encodeURIComponent(contactSellerData.producerName)}`,
		);
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#8BC34A]">
			<div className="flex items-center gap-2 mb-4">
				<FontAwesomeIcon icon={faTruck} className="text-gray-600" />
				<h2 className="text-lg font-semibold text-gray-800">Método de Envío</h2>
			</div>

			{/* Dirección de envío */}
			<div className="mb-6 p-4 bg-gray-50 rounded-lg">
				<div className="flex items-center gap-2 mb-2">
					<FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-600" />
					<span className="font-medium text-gray-800">Envío a:</span>
				</div>
				<p className="text-sm text-gray-600">{fullName}</p>
				<p className="text-sm text-gray-600">{address}</p>
				<button
					onClick={handleEditAddress}
					className="text-xs text-[#8BC34A] hover:text-[#7CB342] mt-2 font-medium"
				>
					[Editar dirección]
				</button>
			</div>

			<div className="mb-4">
				<button
					onClick={handleContactSeller}
					className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-bold text-sm transition-colors cursor-pointer"
				>
					<FontAwesomeIcon icon={faCommentDots} />
					Contactar vendedor
				</button>
			</div>

			{/* Opciones de envío */}
			<div className="space-y-3">
				{shippingOptions.map((option) => (
					<label
						key={option.id}
						className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
					>
						<input
							type="radio"
							name="shipping"
							value={option.id}
							checked={shippingMethod === option.id}
							onChange={() => setShippingMethod(option.id as any)}
							className="mt-1"
						/>
						<div className="flex-1">
							<p className="font-medium text-gray-800">{option.name}</p>
							<p className="text-sm text-gray-600">{option.time}</p>
						</div>
						<span className="font-bold text-gray-800">
							{option.price === 0 ? "Gratis" : `$${option.price.toLocaleString()}`}
						</span>
					</label>
				))}
			</div>
		</div>
	);
};

