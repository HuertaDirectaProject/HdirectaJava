import { useState } from "react";
import { Button } from "../GlobalComponents/Button";
import { faLeaf, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export const AboutSection = () => {
  const [comment, setComment] = useState("");
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) return;

    setComment("");
    setAccepted(false);
  };

  return (
    <section className="bg-linear-to-b from-[#FEF5DC] via-white to-[#FEF5DC]  dark:bg-[#1A221C] dark:from-[#1A221C] dark:via-white/20 dark:to-[#1A221C] pt-5 transition-colors duration-500 ">
      <div className="bg-white dark:bg-[#111814] max-w-350 mx-auto flex flex-col lg:flex-row items-start justify-center gap-10 mt-8 p-8 rounded-2xl transition-colors duration-500">
        
        {/* LEFT SIDE */}
        <div className="text-left p-8 border border-gray-400/60 dark:border-slate-700 rounded-2xl flex-1">
          <h1 className="text-4xl font-bold text-[#2e7d32] mb-6 text-center dark:text-green-400">
            Quiénes Somos
          </h1>

          <p className="text-lg leading-relaxed mb-5 text-gray-800 dark:text-white/80">
            En <strong>Huerta Directa</strong>, creemos en el poder de lo
            natural y en el valor del trabajo local. Nacimos con el sueño de
            acercar productos frescos del campo directamente a tu mesa.
          </p>

          <p className="text-lg leading-relaxed mb-5 text-gray-800 dark:text-white/80">
            Nuestro equipo está formado por pequeños productores comprometidos
            con prácticas sostenibles.
          </p>

          <h2 className="text-2xl font-semibold text-[#558b2f] mt-8 mb-2 dark:text-green-300">
            Nuestra Misión
          </h2>

          <p className="text-lg leading-relaxed mb-5 text-gray-800 dark:text-white/80">
            Conectar a los consumidores con productos frescos, saludables y
            locales.
          </p>

          <h2 className="text-2xl font-semibold text-[#558b2f] mt-8 mb-2 dark:text-green-300">
            Nuestros Valores
          </h2>

          <ul className="space-y-2 text-lg text-gray-800 dark:text-white/80">
            <li>🌱 Compromiso con la naturaleza</li>
            <li>🤝 Transparencia y cercanía</li>
            <li>🚜 Apoyo al productor local</li>
            <li>📦 Entregas responsables</li>
            <li>❤️ Pasión por lo que hacemos</li>
          </ul>
        </div>

        {/* RIGHT SIDE */}
        <div className="border border-gray-400/60 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-16 flex-1">

          {/* COMMENT SECTION */}
          <article>
            <h2 className="text-2xl font-semibold mb-5 text-[#333] dark:text-white">
              💬 Queremos saber tu opinión
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                rows={5}
                placeholder="Escribe tu comentario..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full p-3 border border-gray-400 dark:border-slate-600 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-800 dark:text-white"
              />

              <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
                <label className="flex items-center gap-2 text-gray-700 dark:text-white/80">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={() => setAccepted(!accepted)}
                    required
                    className="accent-green-600"
                  />
                  <span>
                    Acepto los{" "}
                    <a
                      href="#"
                      className="text-[#558b2f] dark:text-green-400 hover:underline"
                    >
                      Términos y Condiciones
                    </a>
                  </span>
                </label>

                <Button
                  text="Enviar"
                  type="submit"
                  iconLetf={faPaperPlane}
                  disabled={!accepted}
                  className="px-4 py-2"
                />
              </div>
            </form>
          </article>

          {/* CTA SECTION */}
          <article className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center border-2 border-gray-300 dark:border-slate-700 transition-colors">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
              Explora Nuestros Productos
            </h2>

            <p className="mb-6 text-gray-600 dark:text-white/70 max-w-md mx-auto">
              Descubre la frescura y el sabor de lo auténtico.
            </p>

            <Button
              to="/productos"
              text="Ver Productos"
              iconLetf={faLeaf}
              className="py-3 px-8"
            />
          </article>
        </div>
      </div>
    </section>
  );
};