import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faShield, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export const SecureFooter = () => {
	return (
		<div className="bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6 rounded-lg mt-8">
			<div className="flex items-center justify-center gap-8">
				{/* Icono 1 */}
				<div className="flex flex-col items-center gap-2 text-center">
					<FontAwesomeIcon icon={faLock} className="w-8 h-8 text-[#8BC34A]" />
					<p className="text-sm font-medium text-gray-800">Pago Seguro</p>
				</div>

				{/* Icono 2 */}
				<div className="flex flex-col items-center gap-2 text-center">
					<FontAwesomeIcon icon={faShield} className="w-8 h-8 text-[#8BC34A]" />
					<p className="text-sm font-medium text-gray-800">Datos Protegidos</p>
				</div>

				{/* Icono 3 */}
				<div className="flex flex-col items-center gap-2 text-center">
					<FontAwesomeIcon icon={faCheckCircle} className="w-8 h-8 text-[#8BC34A]" />
					<p className="text-sm font-medium text-gray-800">Verificado</p>
				</div>
			</div>

			<p className="text-center text-xs text-gray-600 mt-4">
				Procesado por Mercado Pago | SSL Certificado | PCI Compliant
			</p>
		</div>
	);
};
