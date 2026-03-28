import { Link } from "react-router-dom";
import {
  faFacebookF,
  faInstagram,
  faWhatsapp,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Footer = () => {
  return (
    <footer className="w-full bg-[#8bc34a] dark:bg-[#1f2937] text-white relative transition-colors duration-500">

      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r 
      from-green-700 via-lime-500 to-green-700 
      dark:from-green-900 dark:via-green-700 dark:to-green-900"></div>

      {/* Contenedor */}
      <div className="max-w-330 mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Marca */}
        <div>
          <h4 className="text-xl font-bold mb-4">Huerta Directa</h4>
          <p className="text-sm text-green-100 dark:text-gray-300 leading-relaxed">
            Conectamos productores locales con consumidores conscientes.
            Productos frescos directamente del campo a tu hogar.
          </p>

          {/* Redes sociales */}
          <div className="flex gap-4 mt-6">
            {[faFacebookF, faInstagram, faWhatsapp, faXTwitter].map(
              (icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-full 
                  bg-white/20 dark:bg-white/10 
                  hover:bg-white hover:text-[#8bc34a] 
                  dark:hover:bg-green-500 dark:hover:text-white
                  transition-all duration-500 ease-in-out hover:scale-110"
                >
                  <FontAwesomeIcon icon={icon} />
                </a>
              )
            )}
          </div>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Explorar</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/QuienesSomos"
                className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <a
                href="#categorias"
                className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500"
              >
                Categorías
              </a>
            </li>
            <li>
              <a
                href="#ofertas"
                className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500"
              >
                Ofertas
              </a>
            </li>
          </ul>
        </div>

        {/* Soporte */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Soporte</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500">
                Preguntas frecuentes
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500">
                Política de privacidad
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500">
                Términos y condiciones
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#455e28] dark:hover:text-green-400 transition-all duration-500">
                Centro de ayuda
              </a>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contáctanos</h4>
          <ul className="space-y-2 text-sm text-green-100 dark:text-gray-300">
            <li>📧 hdirecta@gmail.com</li>
            <li>📞 +57 3187707557</li>
            <li>📍 Colombia</li>
          </ul>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="bg-[#7cb342] dark:bg-[#111827] text-center py-5 text-sm 
      text-green-100 dark:text-gray-400 border-t border-white/20">
        © {new Date().getFullYear()} Huerta Directa — Todos los derechos reservados
      </div>
    </footer>
  );
};