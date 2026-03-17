import logo from "../../assets/logo_huerta.png";
import { Button } from "../../components/GlobalComponents/Button";
import { Background } from "../../components/GlobalComponents/Background";
import { usePageTitle } from "../../hooks/usePageTitle";

export const Landing = () => {
  usePageTitle("Invitación");

  return (
    <main className="min-h-screen font-sans text-[18px] relative dark:bg-[#1A221C]">
      <Background />

      {/* Sección Invitación */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-10 sm:py-16 md:min-h-[10vh] lg:py-3  lg:min-h-screen">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <img
            src={logo}
            alt="Logo Huerta Directa"
            className="w-32 sm:w-40 md:w-48 mx-auto my-10 transition-transform duration-300 ease-in-out hover:scale-110"
          />

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#4caf50] mb-4">
            ¡Únete a Huerta Directa!
          </h2>

          <p className="text-base sm:text-lg md:text-[1.3rem] text-[#5a4e3c] dark:text-[#b3b3b3] mb-8 px-2 sm:px-0">
            Forma parte de nuestra comunidad que apoya al campo y disfruta de
            productos frescos, saludables y sin intermediarios.
          </p>

          <Button
            to="/login"
            text={"Registrarse"}
            className="inline-block bg-[#78d64b] text-white font-bold py-4 px-10 rounded-full text-[1.1rem] uppercase tracking-[1px] transition-all duration-500 hover:bg-[#5aaa37] hover:scale-105 hover:shadow-lg no-underline"
          />
        </div>
      </section>
    </main>
  );
};