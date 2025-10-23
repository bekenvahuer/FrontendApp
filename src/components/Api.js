import { API_BASE_URL } from "./config";

export const loginWithGoogle = async (googleToken) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login-google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: googleToken }),
        });

        const text = await response.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (error) {
            throw new Error("Respuesta no válida del servidor");
        }

        if (!response.ok) {
            throw new Error(data.error || "Error en la autenticación con Google");
        }

        // Validar que la respuesta contenga los campos esperados
        if (!data.access_token || !data.rol || !data.user) {
            throw new Error("Datos incompletos en la respuesta del servidor");
        }

        // Validar si el usuario necesita actualizar su perfil
        const needsProfileUpdate = !data.user.phone || !data.user.date_of_birth;

        return { ...data, needsProfileUpdate };
    } catch (error) {
        console.error("Error en login con Google:", error.message);
        throw error;
    }
};

export const updateUserProfile = async (userData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");

        const response = await fetch(`${API_BASE_URL}/update-profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                phone: userData.phone,
                date_of_birth: userData.date_of_birth,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Error al actualizar el perfil");
        }

        
        return data;
    } catch (error) {
        console.error("Error en updateUserProfile:", error.message);
        throw error;
    }
};