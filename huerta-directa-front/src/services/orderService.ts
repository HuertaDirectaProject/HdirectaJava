import { API_URL } from "../config/api";

export type OrderStatus = "completed" | "pending" | "canceled";

export interface OrderRow {
  orderNumber: string;
  buyer: string;
  product: string;
  quantity: number;
  date: string;
  amount: number;
  status: OrderStatus;
  paymentId: string;
}

export interface OrdersSummary {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  avgTicket: number;
}

export interface OrdersResponse {
  orders: OrderRow[];
  summary: OrdersSummary;
}

const emptyResponse: OrdersResponse = {
  orders: [],
  summary: {
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    avgTicket: 0,
  },
};

const orderService = {
  async getMyOrders(): Promise<OrdersResponse> {
    const response = await fetch(`${API_URL}/api/payments/my-orders`, {
      credentials: "include",
    });

    if (response.status === 401) {
      return emptyResponse;
    }

    if (!response.ok) {
      throw new Error("No se pudieron cargar las ordenes");
    }

    const data = (await response.json()) as Partial<OrdersResponse>;

    return {
      orders: Array.isArray(data.orders) ? data.orders : [],
      summary: {
        totalOrders: Number(data.summary?.totalOrders ?? 0),
        totalSales: Number(data.summary?.totalSales ?? 0),
        pendingOrders: Number(data.summary?.pendingOrders ?? 0),
        avgTicket: Number(data.summary?.avgTicket ?? 0),
      },
    };
  },
};

export default orderService;
