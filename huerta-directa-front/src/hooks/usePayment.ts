import { useState } from "react";

export const usePayment = () => {
   const [shippingMethod, setShippingMethod] = useState("standard");

   return {
      shippingMethod,
      setShippingMethod
   };
};