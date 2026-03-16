import { useNavigate } from 'react-router-dom';
import { SecureFooter } from '../../components/Checkout/SecureFooter';
import { usePageTitle } from '../../hooks/usePageTitle';

export const StatusPending = () => {
    usePageTitle("Pago Pendiente");
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F5F0E8] py-8 px-4">
            <div className="max-w-xl mx-auto mt-16">
                <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="text-2xl font-bold text-yellow-600 mb-2">Pago pendiente</h1>
                    <p className="text-gray-500 mb-8">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
                    <button
                        onClick={() => navigate('/HomePage')}
                        className="px-8 py-3 bg-[#8dc84b] hover:bg-[#6da82f] text-white font-bold rounded-xl transition-colors"
                    >
                        Volver a la tienda
                    </button>
                </div>
                <SecureFooter />
            </div>
        </div>
    );
};

export default StatusPending;