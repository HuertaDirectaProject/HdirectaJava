import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { CheckoutHeader } from '../../components/Checkout/CheckoutHeader';
import { OrderList } from '../../components/Checkout/OrderList';
import { ShippingCard } from '../../components/Checkout/ShippingCard';
import { OrderSummaryCard } from '../../components/Checkout/OrderSummaryCard';
import { SecureFooter } from '../../components/Checkout/SecureFooter';
import { useCart } from '../../hooks/useCart';
import { usePageTitle } from '../../hooks/usePageTitle';


export const CheckoutSummaryPage = () => {
  usePageTitle("checkout");
  const { items } = useCart();
  const navigate = useNavigate();

  // Si no hay items, redirigir
  // React.useEffect(() => {
  //   if (items.length === 0) {
  //     navigate('Checkout'); //en pruabas uando pasemos ya a tener logiva sera navigate('/HomePage')
  //   }
  // }, [items, navigate]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header de progreso */}
        <CheckoutHeader />

        {/* Grid principal: 2 columnas en desktop, 1 en móvil */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA (70%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faShoppingCart} className="w-5 h-5 text-[#8BC34A]" />
                <h2 className="text-lg font-bold text-gray-800">Productos ({items.length})</h2>
              </div>
              <OrderList />
            </div>

            {/* Envío */}
            <ShippingCard />

          </div>

          {/* COLUMNA DERECHA (30%) - STICKY */}
          <div className="lg:col-span-1">
            <OrderSummaryCard />
          </div>
        </div>

        {/* Footer de seguridad */}
        <SecureFooter />

        {/* Botón volver */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/HomePage')}
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
          >
            ← Volver a comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummaryPage;

