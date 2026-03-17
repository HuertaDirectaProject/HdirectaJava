import React from "react";
import { faCartShopping, faUser, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import { SummaryCard } from "./SummaryCard";

interface Props {
  productsCount: number;
}

export const DashboardAside: React.FC<Props> = ({ productsCount }) => {
  return (
    <aside className="flex flex-col gap-8">

      <SummaryCard
        title="Resumen"
        label="Ordenes Totales"
        value="3,849"
        icon={faCartShopping}
      />

      <SummaryCard
        title="Usuarios"
        label="Usuarios Totales"
        value="100"
        icon={faUser}
      />

      <SummaryCard
        title="Tus Productos"
        label="Productos Totales"
        value={productsCount}
        icon={faBagShopping}
      />

    </aside>
  );
};