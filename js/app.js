async function initSittaApp() {
  try {
    console.log("1. Memulai aplikasi");

    // Pastikan Vue dan service tersedia
    if (typeof Vue === "undefined") {
      throw new Error("Vue.js belum dimuat.");
    }

    if (!window.SittaService) {
      throw new Error("SittaService tidak ditemukan.");
    }

    if (!window.StockTableComponent) {
      throw new Error("StockTableComponent tidak ditemukan.");
    }

    // Ambil template komponen
    console.log("2. Mengambil template");

    const templateResponse = await fetch("templates/stock-table.html");

    if (!templateResponse.ok) {
      throw new Error("Gagal mengambil template stock-table.html");
    }

    const templateHTML = await templateResponse.text();

    window.StockTableComponent.template = templateHTML;

    Vue.component("ba-stock-table", window.StockTableComponent);

    // Ambil template tracking
    const trackingResponse = await fetch("templates/do-tracking.html");

    if (!trackingResponse.ok) {
      throw new Error("Gagal mengambil template do-tracking.html");
    }

    const trackingHTML = await trackingResponse.text();

    window.DoTrackingComponent.template = trackingHTML;

    Vue.component("do-tracking", window.DoTrackingComponent);

    // Ambil data JSON
    console.log("3. Mengambil data JSON");

    const data = await window.SittaService.getData();

    console.log("4. Data berhasil dimuat:", data);

    // Jalankan Vue tanpa menghapus HTML #app
    new Vue({
      el: "#app",

      data: {
        tab: "stok",
        data: data,
        loading: false,
        error: "",
      },
      
      methods: {
        tambahPesanan: function (pesanan) {
          this.$set(this.data.tracking, pesanan.nomorDO, pesanan.detail);

          alert("Pesanan berhasil disimpan. Nomor DO: " + pesanan.nomorDO);
        },
      },
    });

    console.log("5. Aplikasi SITTA berhasil dijalankan");

    // Ambil template order form
    const orderResponse = await fetch("templates/order-form.html");

    if (!orderResponse.ok) {
      throw new Error("Gagal mengambil template order-form.html");
    }

    const orderHTML = await orderResponse.text();

    window.OrderFormComponent.template = orderHTML;

    Vue.component("order-form", window.OrderFormComponent);
  } catch (error) {
    console.error("Gagal menjalankan SITTA:", error);

    const errorElement = document.getElementById("startup-error");

    if (errorElement) {
      errorElement.textContent = error.message;
    } else {
      alert("Gagal menjalankan SITTA: " + error.message);
    }
  }
}

initSittaApp();
