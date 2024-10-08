"use client";

import { useEffect, useState, useRef } from "react";
import { FaShoppingCart, FaCreditCard } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';

const mockProduct = {
  id: "1",
  name: "Zapatillas Nike Retro Full",
  price: "50.00",
  images: ["/images/img1.jpg"], // imagenes de public
  storeId: "store-1",
  size: { value: "M" },
  color: { value: "#ff5733" },
  category: { name: "Zapatillas" },
};

const ProductView = () => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [product, setProduct] = useState(mockProduct);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string;
    if (publicKey) {
      initMercadoPago(publicKey, {
        locale: 'es-PE',
      });
    }
    setLoading(false);
  }, []);

  const createPreference = async () => {
    try {
      setIsCreatingPreference(true);
      const response = await axios.post('http://localhost:3000/create_preference', {
        title: product.name,
        quantity: quantity,
        price: parseFloat(product.price),
        productId: product.id,
      });

      return response.data.id; // Devuelve el ID de la preferencia creada
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la preferencia");
      return null;
    } finally {
      setIsCreatingPreference(false);
    }
  };

  const handleBuy = async () => {
    const id = await createPreference();
    if (id) {
      setPreferenceId(id);
    }
  };

  const handleOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product?.storeId || !product?.id) {
      setFormError("Missing product or store information.");
      return;
    }

    if (quantity <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // Simulación de procesamiento del pedido
    toast.info('Pedido Exitoso.');
    formRef.current?.reset();
    setPhone('');
    setAddress('');
    setQuantity(1);
    setIsSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="p-4 max-w-screen-lg mx-auto py-36">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 relative aspect-w-16 aspect-h-9">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-2xl text-gray-900">${parseFloat(product.price).toFixed(2)}</p>
          </div>
          <hr className="my-4" />
          <div className="flex flex-col gap-y-6">
            <div className="flex items-center gap-x-4">
              <h3 className="font-semibold text-black">Tamaño:</h3>
              <div>{product.size?.value}</div>
            </div>
            <div className="flex items-center gap-x-4">
              <h3 className="font-semibold text-black">Color:</h3>
              <div className="h-6 w-6 rounded-full border border-gray-600" style={{ backgroundColor: product.color?.value }} />
            </div>
            <div className="flex items-center gap-x-4">
              <h3 className="font-semibold text-black">Categoría:</h3>
              <div>{product.category?.name}</div>
            </div>
          </div>
          <form onSubmit={handleOrder} className="mt-6 space-y-4" ref={formRef}>
            {formError && <p className="text-red-600 mb-4 text-sm font-medium">{formError}</p>}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min="1"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-500 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700"
              disabled={isSubmitting}>
               {isSubmitting ? 'Processing...' : 'Deliveri'}
            </button>
          </form>
          <button onClick={handleBuy} type="button" className="w-full flex items-center justify-center px-4 py-2 bg-green-400 text-white font-semibold rounded-md shadow-md hover:bg-green-700 mt-4" disabled={isCreatingPreference}>
          <FaCreditCard className="mr-2" />{isCreatingPreference ? 'Creando Preferencia...' : 'Pagar'}
          </button>
           {preferenceId && <Wallet initialization={{ preferenceId: preferenceId }} />}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductView;
