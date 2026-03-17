import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCheck,
	faShoppingCart,
	faTruck,
	faCreditCard,
	faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const steps = [
	{ name: "Carrito", icon: faShoppingCart, color: "completed" },
	{ name: "Información", icon: faTruck, color: "completed" },
	{ name: "Pago", icon: faCreditCard, color: "active" },
	{ name: "Confirmación", icon: faCheckCircle, color: "inactive" },
];

export const CheckoutHeader = () => {
	return (
		<div className="bg-white border-b-2 border-[#8BC34A] p-6 mb-8">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Confirmar Compra</h1>

			<div className="flex items-center justify-between">
				{steps.map((step, index) => {
					return (
						<div key={index}>
							{/* Punto */}
							<div
								className={`
                  flex items-center justify-center w-12 h-12 rounded-full shrink-0
                  ${
										step.color === "completed"
											? "bg-[#8BC34A] text-white"
											: step.color === "active"
											? "bg-[#FFC107] text-white"
											: "bg-gray-200 text-gray-400"
									}
                `}
							>
								{step.color === "completed" ? (
									<FontAwesomeIcon icon={faCheck} className="w-6 h-6" />
								) : (
									<FontAwesomeIcon icon={step.icon} className="w-6 h-6" />
								)}
							</div>

							{/* Línea conectora */}
							{index < steps.length - 1 && (
								<div
									className={`
                    flex-1 h-1 mx-2
                    ${step.color === "completed" ? "bg-[#8BC34A]" : "bg-gray-300"}
                  `}
								/>
							)}
						</div>
					);
				})}
			</div>

			<div className="flex justify-between mt-4 text-sm text-gray-600">
				{steps.map((step) => (
					<span key={step.name} className="flex-1 text-center">
						{step.name}
					</span>
				))}
			</div>
		</div>
	);
};
