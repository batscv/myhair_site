const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

export const fetchProducts = async (filters?: any) => {
    let url = `${API_URL}/api/produtos`;
    if (filters) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        url += `?${params.toString()}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar produtos');
    return response.json();
};

export const fetchSearchSuggestions = async (query: string) => {
    const response = await fetch(`${API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Erro ao buscar sugestões');
    return response.json();
};

export const fetchCategories = async () => {
    const response = await fetch(`${API_URL}/api/categorias`);
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    return response.json();
};

export const fetchBanners = async () => {
    const response = await fetch(`${API_URL}/api/banners`);
    if (!response.ok) throw new Error('Erro ao buscar banners');
    return response.json();
};

export const fetchProductById = async (id: string | number) => {
    const response = await fetch(`${API_URL}/api/produtos/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar produto');
    return response.json();
};

// --- FUNÇÕES ADMINISTRATIVAS ---

export const adminLogin = async (credentials: any) => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Falha no login');
    return response.json();
};

export const saveProduct = async (product: any) => {
    const method = product.id ? 'PUT' : 'POST';
    const url = product.id ? `${API_URL}/api/produtos/${product.id}` : `${API_URL}/api/produtos`;

    // Para Base64 puro, JSON é mais seguro e simples que FormData (que esbarra em limites do Multer)
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    });

    if (!response.ok) {
        const text = await response.text();
        try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.error || errorData.details || 'Erro ao salvar produto');
        } catch (e) {
            // Se não for JSON, mostra o texto cru (limitado a 100 caracteres para caber no toast)
            const errorPreview = text.substring(0, 100);
            throw new Error(`Erro Servidor (${response.status}): ${errorPreview}...`);
        }
    }
    return response.json();
};

export const deleteProduct = async (id: number) => {
    const response = await fetch(`${API_URL}/api/produtos/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir produto');
    return response.json();
};

export const saveCategory = async (category: any) => {
    const response = await fetch(`${API_URL}/api/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error('Erro ao salvar categoria');
    return response.json();
};

export const deleteCategory = async (id: number) => {
    const response = await fetch(`${API_URL}/api/categorias/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir categoria');
    return response.json();
};

export const saveBanner = async (banner: any) => {
    const url = `${API_URL}/api/banners`;
    const formData = new FormData();
    Object.keys(banner).forEach(key => {
        if (banner[key] !== undefined && banner[key] !== null) {
            formData.append(key, banner[key]);
        }
    });

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Erro ao salvar banner');
    }
    return response.json();
};

export const deleteBanner = async (id: number) => {
    const response = await fetch(`${API_URL}/api/banners/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir banner');
    return response.json();
};

export const fetchMarcas = async () => {
    const response = await fetch(`${API_URL}/api/marcas`);
    if (!response.ok) throw new Error('Erro ao buscar marcas');
    return response.json();
};

export const saveMarca = async (marca: any) => {
    const url = `${API_URL}/api/marcas`;
    const formData = new FormData();
    Object.keys(marca).forEach(key => {
        if (marca[key] !== undefined && marca[key] !== null) {
            formData.append(key, marca[key]);
        }
    });

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Erro ao salvar marca');
    }
    return response.json();
};

export const deleteMarca = async (id: number) => {
    const response = await fetch(`${API_URL}/api/marcas/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir marca');
    return response.json();
};

// --- USUÁRIOS E FEEDBACK ---

export const userLogin = async (credentials: any) => {
    const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Credenciais inválidas');
    return response.json();
};

export const userRegister = async (userData: any) => {
    const response = await fetch(`${API_URL}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar conta');
    }
    return response.json();
};

export const fetchReviewsByProduct = async (id: string | number) => {
    const response = await fetch(`${API_URL}/api/produtos/${id}/avaliacoes`);
    if (!response.ok) throw new Error('Erro ao buscar avaliações');
    return response.json();
};

export const postReview = async (review: any) => {
    const response = await fetch(`${API_URL}/api/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
    });
    if (!response.ok) throw new Error('Erro ao enviar avaliação');
    return response.json();
};

export const fetchUserProfile = async (id: number) => {
    const response = await fetch(`${API_URL}/api/usuarios/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    return response.json();
};

export const updateUserProfile = async (id: number, data: any) => {
    const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar perfil');
    return response.json();
};

// --- PEDIDOS ---

export const createOrder = async (orderData: any) => {
    const response = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Erro ao processar pedido');
    return response.json();
};

export const fetchAdminOrders = async () => {
    const response = await fetch(`${API_URL}/api/admin/pedidos`);
    if (!response.ok) throw new Error('Erro ao buscar pedidos');
    return response.json();
};

export const fetchAdminOrderDetail = async (id: string | number) => {
    const response = await fetch(`${API_URL}/api/admin/pedidos/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar detalhes do pedido');
    return response.json();
};

export const updateOrderStatus = async (id: number, status: string) => {
    const response = await fetch(`${API_URL}/api/admin/pedidos/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Erro ao atualizar status');
    return response.json();
};

// --- USUÁRIOS (ADMIN) ---

export const fetchAdminUsers = async () => {
    const response = await fetch(`${API_URL}/api/admin/usuarios`);
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
};

export const fetchUserOrdersHistory = async (id: number) => {
    const response = await fetch(`${API_URL}/api/admin/usuarios/${id}/pedidos`);
    if (!response.ok) throw new Error('Erro ao buscar histórico do usuário');
    return response.json();
};

export const updateUserRole = async (id: number, tipo: string) => {
    const response = await fetch(`${API_URL}/api/admin/usuarios/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo })
    });
    if (!response.ok) throw new Error('Erro ao alterar nível de acesso');
    return response.json();
};

// --- AVALIAÇÕES (ADMIN) ---

export const fetchAdminReviews = async () => {
    const response = await fetch(`${API_URL}/api/admin/avaliacoes`);
    if (!response.ok) throw new Error('Erro ao buscar avaliações');
    return response.json();
};

export const approveReview = async (id: number) => {
    const response = await fetch(`${API_URL}/api/admin/avaliacoes/${id}/aprovar`, {
        method: 'PUT'
    });
    if (!response.ok) throw new Error('Erro ao aprovar avaliação');
    return response.json();
};

export const deleteReview = async (id: number) => {
    const response = await fetch(`${API_URL}/api/admin/avaliacoes/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao excluir avaliação');
    return response.json();
};
// --- CONFIGURAÇÕES ---

export const fetchSettings = async () => {
    const response = await fetch(`${API_URL}/api/configuracoes`);
    if (!response.ok) throw new Error('Erro ao buscar configurações');
    return response.json();
};

export const updateSettings = async (settings: any) => {
    const response = await fetch(`${API_URL}/api/configuracoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Erro ao atualizar configurações');
    return response.json();
};

export const fetchAdminMetrics = async () => {
    const response = await fetch(`${API_URL}/api/admin/metrics`);
    if (!response.ok) throw new Error('Erro ao buscar métricas');
    return response.json();
};

export const saveCart = async (usuario_id: number, itens: any[]) => {
    const response = await fetch(`${API_URL}/api/carrinho`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id, itens })
    });
    return response.json();
};

export const fetchCart = async (usuario_id: number) => {
    const response = await fetch(`${API_URL}/api/carrinho/${usuario_id}`);
    if (!response.ok) throw new Error('Erro ao buscar carrinho');
    return response.json();
};

export const fetchAdminCoupons = async () => {
    const response = await fetch(`${API_URL}/api/admin/cupons`);
    if (!response.ok) throw new Error('Erro ao buscar cupons');
    return response.json();
};

export const createCoupon = async (coupon: any) => {
    const response = await fetch(`${API_URL}/api/admin/cupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar cupom');
    }
    return response.json();
};

export const deleteCoupon = async (id: number) => {
    const response = await fetch(`${API_URL}/api/admin/cupons/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir cupom');
    return response.json();
};

export const validateCoupon = async (codigo: string) => {
    const response = await fetch(`${API_URL}/api/cupons/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Cupom inválido');
    }
    return response.json();
};

export const fetchUserOrders = async (userId: number) => {
    const response = await fetch(`${API_URL}/api/usuarios/${userId}/pedidos`);
    if (!response.ok) throw new Error('Erro ao buscar histórico de pedidos');
    return response.json();
};

export const fetchAdminPopups = async () => {
    const response = await fetch(`${API_URL}/api/admin/popups`);
    if (!response.ok) throw new Error('Erro ao buscar popups');
    return response.json();
};

export const savePopup = async (popup: any) => {
    const formData = new FormData();
    Object.keys(popup).forEach(key => {
        if (popup[key] !== undefined && popup[key] !== null) {
            formData.append(key, popup[key]);
        }
    });

    const response = await fetch(`${API_URL}/api/admin/popups`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) throw new Error('Erro ao salvar popup');
    return response.json();
};

export const deletePopup = async (id: number) => {
    const response = await fetch(`${API_URL}/api/admin/popups/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir popup');
    return response.json();
};

export const togglePopupStatus = async (id: number, ativo: boolean) => {
    const response = await fetch(`${API_URL}/api/admin/popups/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo })
    });
    if (!response.ok) throw new Error('Erro ao atualizar status');
    return response.json();
};

export const fetchActivePopup = async () => {
    const response = await fetch(`${API_URL}/api/popups/ativo`);
    if (!response.ok) throw new Error('Erro ao buscar popup ativo');
    return response.json();
};
