
window.SittaService = {
    async getData() {
        const response = await fetch('data/dataBahanAjar.json');

        if (!response.ok) {
            throw new Error(
                'Gagal mengambil data JSON. Status: ' + response.status
            );
        }

        const data = await response.json();

        // Normalisasi data tracking
        const trackingObject = {};

        if (Array.isArray(data.tracking)) {
            data.tracking.forEach(item => {
                Object.keys(item).forEach(nomorDO => {
                    trackingObject[nomorDO] = item[nomorDO];
                });
            });
        } else {
            Object.assign(trackingObject, data.tracking);
        }

        data.tracking = trackingObject;

        return data;
    }
};
