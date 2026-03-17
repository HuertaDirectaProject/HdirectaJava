import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEnvelope, faPaperPlane, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import "./Login.css";
import { Background } from "../../components/GlobalComponents/Background";
import logo from "../../assets/logo_huerta.png";
import { Button } from "../../components/GlobalComponents/Button";
import { usePageTitle } from "../../hooks/usePageTitle";
import authService from "../../services/authService";

const ForgotPassword: React.FC = () => {
	usePageTitle("Recuperar contraseña");

	const [email, setEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setIsSubmitting(true);

		try {
			const response = await authService.forgotPassword(email);
			setSuccess(response.message);
			setEmail("");
		} catch (err: any) {
			setError(err.message || "No fue posible procesar la solicitud");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="flex items-center justify-center min-h-screen bg-[#FEF5DC] dark:bg-[#1A221C]! font-['Poppins'] relative px-4">
			<Background />

			{error && (
				<div className="fixed top-5 right-5 bg-[#dc3545] text-white border border-[#dc3545] rounded-[10px] text-center font-medium w-75 text-[13px] p-[15px_20px] z-1000 shadow-[0_4px_12px_rgba(220,53,69,0.2)] flex items-center justify-between">
					<span>{error}</span>
					<button onClick={() => setError(null)} className="ml-2">
						x
					</button>
				</div>
			)}

			{success && (
				<div className="fixed top-5 right-5 bg-[#52c41a] text-white border border-[#52c41a] rounded-[10px] text-center font-medium w-75 text-[13px] p-[15px_20px] z-1000 shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-between">
					<span>{success}</span>
					<button onClick={() => setSuccess(null)} className="ml-2">
						x
					</button>
				</div>
			)}

			<div className="login-container bg-white dark:bg-[#1f2a22]! overflow-hidden rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] max-md:h-auto max-md:min-h-180 max-md:flex max-md:flex-col">
				<div className="form-container left-0 w-1/2 z-2 max-md:static max-md:w-full max-md:h-auto">
					<form
						onSubmit={handleSubmit}
						className="bg-white dark:bg-[#1f2a22] w-113.5 max-w-full flex items-center justify-center flex-col px-10 py-12 h-full"
					>
						<h1 className="text-3xl font-bold mb-3 dark:text-white text-center">Recuperar contraseña</h1>
						<img src={logo} alt="Logo huerta directa" className="w-20 mb-4" />

						<p className="text-sm text-[#5B5B5B] dark:text-gray-300 text-center mb-6 leading-6">
							Ingresa tu correo y te enviaremos una nueva contraseña temporal al email registrado.
						</p>

						<div className="w-full mb-4">
							<label className="text-sm font-normal block dark:text-gray-300">
								Ingrese su correo electrónico
							</label>
							<div className="relative flex items-center">
								<FontAwesomeIcon
									icon={faEnvelope}
									className="absolute left-3 text-[#888] dark:text-gray-400"
								/>
								<input
									type="email"
									name="email"
									placeholder="Ej: tunombre@correo.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="py-2.5 pl-10 pr-4 w-full my-1.5 border-2 border-[#8dc84b] dark:border-[#6fa33b] rounded-[15px] outline-none text-base text-[#333128] dark:text-white dark:bg-[#26322a] transition-all duration-500 focus:border-[#004d00] focus:shadow-[0_0_5px_rgba(0,77,0,0.5)]"
									required
								/>
							</div>
						</div>

						<Button
							text={isSubmitting ? "Enviando..." : "Enviar recuperación"}
							iconRight={faPaperPlane}
							type="submit"
							disabled={isSubmitting}
							className="text-[17px] inline-block py-3 px-8 text-white bg-[#8dc84b] rounded-[15px] transition-all duration-500 mt-2.5 hover:bg-[#004d00] font-semibold uppercase text-xs tracking-wider cursor-pointer w-full"
						/>

						<Link
							to="/login"
							className="mt-5 text-[13px] text-[#333] dark:text-gray-300 no-underline hover:text-[#8dc84b] transition-colors duration-500 inline-flex items-center gap-2"
						>
							<FontAwesomeIcon icon={faArrowLeft} />
							Volver al inicio de sesión
						</Link>
					</form>
				</div>

				<div className="toggle-container max-md:static max-md:w-full max-md:h-auto max-md:min-h-70 max-md:rounded-t-[40px] max-md:rounded-b-none max-md:left-0">
					<div className="toggle max-md:left-0 max-md:w-full">
						<div className="toggle-panel toggle-right max-md:static max-md:w-full max-md:px-8 max-md:py-12">
							<div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
								<FontAwesomeIcon icon={faShieldHalved} className="text-2xl" />
							</div>
							<h2 className="text-3xl font-bold mb-4">Proceso seguro</h2>

							<div className="text-left text-sm leading-6 max-w-[320px] bg-white/12 rounded-2xl px-5 py-4 backdrop-blur-sm">
                            <p>Para recuperar tu acceso:</p>
                            <p>1. Ingresa el correo asociado a tu cuenta.</p>
                            <p>2. Recibirás un correo con instrucciones para restablecer tu contraseña.</p>
                            <p>3. Sigue los pasos indicados para crear una nueva contraseña.</p>
                            </div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default ForgotPassword;
