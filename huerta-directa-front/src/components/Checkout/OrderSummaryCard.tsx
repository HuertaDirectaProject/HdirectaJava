import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../hooks/useCart";
import { Button } from "../GlobalComponents/Button.tsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const OrderSummaryCard = () => {
	const { totals, items } = useCart();
	const navigate = useNavigate();

	const handleProceedToPayment = async () => {
		if (items.length === 0) {
			await Swal.fire({
				icon: "warning",
				title: "Carrito vacío",
				text: "Debes tener productos en el carrito antes de proceder al pago",
				confirmButtonColor: "#8dc84b",
			});
			return;
		}

		navigate("/payment/MercadoPayment");
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("es-CO", {
			style: "currency",
			currency: "COP",
			minimumFractionDigits: 0,
		}).format(price);
	};

	return (
		<div className="bg-white border-2 border-[#8BC34A] rounded-lg p-6 sticky top-24 h-fit">
			<h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido</h2>

			{/* Totales */}
			<div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
				<div className="flex justify-between text-gray-700">
					<span>Subtotal</span>
					<span className="font-medium">{formatPrice(totals.subtotal)}</span>
				</div>

				{totals.descuento > 0 && (
					<div className="flex justify-between text-green-600">
						<span>Descuento 10%</span>
						<span className="font-medium">-{formatPrice(totals.descuento)}</span>
					</div>
				)}

				<div className="flex justify-between text-gray-700">
					<span>Envío</span>
					<span className="font-medium">$5.000</span>
				</div>

				<div className="flex justify-between text-gray-700">
					<span>IVA (19%)</span>
					<span className="font-medium">+{formatPrice(totals.iva)}</span>
				</div>
			</div>

			{/* Total Grande */}
			<div className="flex justify-between mb-6">
				<span className="text-xl font-bold text-gray-800">Total</span>
				<span className="text-3xl font-bold text-[#8BC34A]">{formatPrice(totals.total)}</span>
			</div>

			{/* Botón Pagar */}
			<Button
				onClick={handleProceedToPayment}
				text="Proceder al Pago"
				iconLetf={faCreditCard}
				className="w-full py-3"
			/>


			{/* Info de seguridad */}
			<p className="text-center text-xs text-gray-500 mt-4">
				🔒 Pago seguro - Tus datos están protegidos
			</p>
		</div>
	);
};

