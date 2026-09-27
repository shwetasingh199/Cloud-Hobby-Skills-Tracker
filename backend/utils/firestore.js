function serializeDoc(doc) {
    if (!doc.exists) {
        return null;
    }

    const data = doc.data();

    return {
        id: doc.id,
        ...serializeData(data)
    };
}

function serializeData(data) {
    const result = {};

    for (const [key, value] of Object.entries(data)) {
        if (value && typeof value.toDate === "function") {
            result[key] = value.toDate().toISOString();
        } else {
            result[key] = value;
        }
    }

    return result;
}

function serializeSnapshot(snapshot) {
    return snapshot.docs.map((doc) => serializeDoc(doc));
}

module.exports = {
    serializeDoc,
    serializeData,
    serializeSnapshot
};