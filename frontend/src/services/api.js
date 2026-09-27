const API_URL =
    "http://localhost:5000/api";

export async function authenticatedRequest(
    endpoint,
    options = {},
    user
) {
    if (!user) {
        throw new Error(
            "User is not authenticated"
        );
    }

    const token =
        await user.getIdToken();

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers: {
                    "Content-Type":
                        "application/json",
                    ...(options.headers || {}),
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "Server returned an invalid response"
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Request failed"
        );
    }

    return data;
}

export async function apiGet(
    endpoint,
    user
) {
    return authenticatedRequest(
        endpoint,
        {
            method: "GET"
        },
        user
    );
}

export async function apiPost(
    endpoint,
    body,
    user
) {
    return authenticatedRequest(
        endpoint,
        {
            method: "POST",
            body: JSON.stringify(body)
        },
        user
    );
}

export async function apiPut(
    endpoint,
    body,
    user
) {
    return authenticatedRequest(
        endpoint,
        {
            method: "PUT",
            body: JSON.stringify(body)
        },
        user
    );
}

export async function apiDelete(
    endpoint,
    user
) {
    return authenticatedRequest(
        endpoint,
        {
            method: "DELETE"
        },
        user
    );
}