// Servicio de autenticación para gestionar sesiones


export interface User {
  id: number;
  name: string;
  email: string;
  idRole: number | null;
  profileImageUrl?: string;
  phone?: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  idRole: number | null;
  profileImageUrl?: string;
  status: string;
  message: string;
  redirect?: string;
  maskedEmail?: string;
  hasPhone?: boolean;
  phone?: string;

}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  idRole: number | null;
  profileImageUrl?: string;
  message: string;
  phone?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  idRole: number | null;
  profileImageUrl?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface ErrorResponse {
  message: string;
}

class AuthService {
  private readonly STORAGE_KEY = 'user';
  private readonly AUTH_CHANGED_EVENT = 'huerta-auth-user-changed';
  private readonly BASE_URL = import.meta.env.VITE_API_URL ?? ''; // Vite comuniccion con backend

  /**
   * Registrar nuevo usuario
   */
  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await fetch(`${this.BASE_URL}/api/login/register`, { // 👈 cambia
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
       credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Error en el registro');
    }

    const data: RegisterResponse = await response.json();
    
    // Guardar usuario en localStorage
    this.saveUser({
      id: data.id,
      name: data.name,
      email: data.email,
      idRole: data.idRole,
      profileImageUrl: data.profileImageUrl,
      phone: data.phone,
    });

    return data;
  }

  /**
   * Registrar nuevo administrador (requiere sesión admin activa en backend)
   */
  async registerAdmin(name: string, email: string, password: string): Promise<RegisterResponse> {
    const response = await this.safeFetch(`${this.BASE_URL}/api/login/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      return (await response.json()) as RegisterResponse;
    }

    // Fallback para backend antiguo que no tiene /api/login/admin/register
    if (response.status === 404) {
      return this.registerAdminLegacy(name, email, password);
    }

    const errorMessage = await this.extractErrorMessage(response, 'Error al registrar administrador');
    throw new Error(errorMessage);
  }

  private async registerAdminLegacy(name: string, email: string, password: string): Promise<RegisterResponse> {
    const payload = new URLSearchParams({
      name,
      email,
      password,
    });

    const response = await this.safeFetch(`${this.BASE_URL}/registrarAdmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',
      body: payload.toString(),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Error al registrar administrador (HTTP ${response.status})`);
    }

    const finalUrl = response.url || '';
    if (finalUrl.includes('/agregar_admin')) {
      throw new Error('No se pudo registrar el administrador. Verifica si el correo ya existe.');
    }

    if (finalUrl.includes('/login')) {
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente como administrador.');
    }

    return {
      id: 0,
      name,
      email,
      idRole: 1,
      message: 'Administrador registrado exitosamente',
    };
  }

  /**
   * Iniciar sesión
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.BASE_URL}/api/login/loginUser`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
       credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const data: LoginResponse = await response.json();

    // Guardar usuario en localStorage
    if (data.status === 'success') {
      this.saveUser({
        id: data.id,
        name: data.name,
        email: data.email,
        idRole: data.idRole,
        profileImageUrl: data.profileImageUrl,
      });
    }

    return data;
  }

  /**
   * Verificar código OTP enviado por correo
   */
  async verifyEmailCode(code: string): Promise<LoginResponse> {
    const response = await fetch(`${this.BASE_URL}/api/login/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Código inválido');
    }

    const data: LoginResponse = await response.json();

    if (data.status === 'success') {
      this.saveUser({
        id: data.id,
        name: data.name,
        email: data.email,
        idRole: data.idRole,
        profileImageUrl: data.profileImageUrl,
      });
    }

    return data;
  }

  /**
   * Iniciar verificación según canal seleccionado
   */
  async startVerificationChannel(channel: "email" | "sms"): Promise<LoginResponse> {
    const response = await fetch(`${this.BASE_URL}/api/login/start-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ channel }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'No se pudo iniciar la verificación');
    }

    return (await response.json()) as LoginResponse;
  }

  /**
   * Reenviar código OTP por correo
   */
  async resendEmailCode(): Promise<LoginResponse> {
    const response = await fetch(`${this.BASE_URL}/api/login/resend-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'No se pudo reenviar el código');
    }

    return (await response.json()) as LoginResponse;
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${this.BASE_URL}/api/login/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || 'Error al procesar la recuperación');
    }

    return (await response.json()) as ForgotPasswordResponse;
  }

  /**
   * Obtener perfil según la sesión actual
   */
  async getProfile(): Promise<ProfileResponse> {
    const sessionUser = this.getCurrentUser();

    const response = await this.safeFetch(`${this.BASE_URL}/api/login/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      return (await response.json()) as ProfileResponse;
    }

    if (response.status === 404) {
      if (sessionUser?.id) {
        return {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          phone: '',
          address: '',
          idRole: sessionUser.idRole,
          profileImageUrl: sessionUser.profileImageUrl,
        };
      }

      throw new Error('Tu backend local no tiene cargado el endpoint de perfil. Reinicia la aplicación Spring Boot local.');
    }

    if (!sessionUser?.id) {
      const message = await this.extractErrorMessage(response, 'No se pudo obtener el perfil');
      throw new Error(message);
    }

    const message = await this.extractErrorMessage(response, 'No se pudo obtener el perfil');
    throw new Error(message);
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    const response = await this.safeFetch(`${this.BASE_URL}/api/login/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as ProfileResponse;

      this.saveUser({
        id: data.id,
        name: data.name,
        email: data.email,
        idRole: data.idRole,
        profileImageUrl: data.profileImageUrl,
      });

      return data;
    }

    if (response.status === 404) {
      throw new Error('El backend local que está corriendo no tiene el endpoint para guardar perfil. Reinicia la aplicación Spring Boot local.');
    }

    const message = await this.extractErrorMessage(response, 'No se pudo actualizar el perfil');
    throw new Error(message);
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.safeFetch(`${this.BASE_URL}/api/login/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (response.ok) {
      return (await response.json()) as { message: string };
    }

    if (response.status === 404) {
      throw new Error('El backend local que está corriendo no tiene el endpoint para cambiar contraseña. Reinicia la aplicación Spring Boot local.');
    }

    const message = await this.extractErrorMessage(response, 'No se pudo cambiar la contraseña');
    throw new Error(message);
  }

  /**
   * Subir foto de perfil del usuario autenticado
   */
  async uploadProfilePhoto(photo: File): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await this.safeFetch(`${this.BASE_URL}/api/login/profile/photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('El backend local que está corriendo no tiene el endpoint para subir foto de perfil. Reinicia la aplicación Spring Boot local.');
      }
      const message = await this.extractErrorMessage(response, 'No se pudo subir la foto de perfil');
      throw new Error(message);
    }

    const data = (await response.json()) as ProfileResponse;
    const currentUser = this.getCurrentUser();

    this.saveUser({
      id: data.id,
      name: data.name,
      email: data.email,
      idRole: data.idRole,
      profileImageUrl: data.profileImageUrl ?? currentUser?.profileImageUrl,
    });

    return data;
  }

  private async extractErrorMessage(response: Response, fallback: string): Promise<string> {
    try {
      const data = await response.json();
      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
      }

      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error;
      }

      return `${fallback} (HTTP ${response.status})`;
    } catch {
      return `${fallback} (HTTP ${response.status})`;
    }
  }

  private async safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(input, init);
    } catch {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo y permita CORS.');
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.BASE_URL}/api/login/logout`, { // 👈 cambia
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
         credentials: "include",
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      this.clearUser();
    }
  }

  /**
   * Verificar sesión activa en el servidor
   */
  async checkSession(): Promise<LoginResponse | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/login/session`, { // 👈 cambia
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
         credentials: "include",
      });

      if (!response.ok) {
        this.clearUser();
        return null;
      }

      const data: LoginResponse = await response.json();
      
      // Actualizar localStorage con datos de sesión
      this.saveUser({
        id: data.id,
        name: data.name,
        email: data.email,
        idRole: data.idRole,
        profileImageUrl: data.profileImageUrl,
      });

      return data;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      this.clearUser();
      return null;
    }
  }

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.STORAGE_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.idRole === 1;
  }

  /**
   * Guardar usuario en localStorage
   */
  private saveUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(this.AUTH_CHANGED_EVENT));
  }

  /**
   * Limpiar usuario del localStorage
   */
  private clearUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem("huerta_chat_history");
    window.dispatchEvent(new CustomEvent(this.AUTH_CHANGED_EVENT));
  }
}

// Exportar instancia única del servicio
const authService = new AuthService();
export default authService;
