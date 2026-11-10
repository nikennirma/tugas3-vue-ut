window.StockTableComponent = {
  props: {
    stok: {
      type: Array,
      default: function () {
        return [];
      },
    },
    upbjjList: {
      type: Array,
      default: function () {
        return [];
      },
    },
    kategoriList: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  data: function () {
    return {
      localStok: this.stok.map((item) => ({ ...item })),

      keyword: "",
      filterUpbjj: "",
      filterKategori: "",
      filterStatus: "",
      sortBy: "judul",

      tampilForm: false,
      modeEdit: false,

      form: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      },
    };
  },

  computed: {
    kategoriTersedia: function () {
      if (!this.filterUpbjj) {
        return this.kategoriList;
      }

      return [
        ...new Set(
          this.localStok
            .filter((item) => item.upbjj === this.filterUpbjj)
            .map((item) => item.kategori),
        ),
      ];
    },

    stokTerfilter: function () {
      let hasil = this.localStok.filter((item) => {
        const kata = this.keyword.toLowerCase();

        const cocokKeyword =
          item.kode.toLowerCase().includes(kata) ||
          item.judul.toLowerCase().includes(kata);

        const cocokUpbjj = !this.filterUpbjj || item.upbjj === this.filterUpbjj;

        const cocokKategori =
          !this.filterKategori || item.kategori === this.filterKategori;

        let cocokStatus = true;

        if (this.filterStatus === "aman") {
          cocokStatus = item.qty >= item.safety;
        } else if (this.filterStatus === "menipis") {
          cocokStatus = item.qty > 0 && item.qty < item.safety;
        } else if (this.filterStatus === "kosong") {
          cocokStatus = item.qty === 0;
        } else if (this.filterStatus === "perlu-pesan") {
          cocokStatus = item.qty < item.safety;
        }

        return cocokKeyword && cocokUpbjj && cocokKategori && cocokStatus;
      });

      return hasil.sort((a, b) => {
        if (this.sortBy === "judul") {
          return a.judul.localeCompare(b.judul);
        }

        if (this.sortBy === "stok") {
          return a.qty - b.qty;
        }

        if (this.sortBy === "harga") {
          return a.harga - b.harga;
        }

        return 0;
      });
    },
  },

  watch: {
    filterUpbjj: function () {
      this.filterKategori = "";
    },

    stok: {
      deep: true,
      handler: function (dataBaru) {
        this.localStok = dataBaru.map((item) => ({ ...item }));
      },
    },
  },

  methods: {
    formatRupiah: function (nilai) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(nilai);
    },

    statusStok: function (item) {
      if (item.qty === 0) return "Kosong";
      if (item.qty < item.safety) return "Menipis";
      return "Aman";
    },

    statusClass: function (item) {
      if (item.qty === 0) return "status-empty";
      if (item.qty < item.safety) return "status-low";
      return "status-safe";
    },

    resetFilter: function () {
      this.keyword = "";
      this.filterUpbjj = "";
      this.filterKategori = "";
      this.filterStatus = "";
      this.sortBy = "judul";
    },

    resetForm: function () {
      this.form = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
    },

    bukaTambah: function () {
      this.resetForm();
      this.modeEdit = false;
      this.tampilForm = true;
    },

    editItem: function (item) {
      this.form = {
        ...item,
        kodeAsli: item.kode,
      };

      this.modeEdit = true;
      this.tampilForm = true;
    },

    simpanStok: function () {
      // Validasi wajib
      if (
        !this.form.kode.trim() ||
        !this.form.judul.trim() ||
        !this.form.kategori ||
        !this.form.upbjj ||
        !this.form.lokasiRak.trim()
      ) {
        alert("Mohon lengkapi semua data wajib.");
        return;
      }

      // Validasi angka
      if (
        this.form.harga < 0 ||
        this.form.qty < 0 ||
        this.form.safety < 0 ||
        !Number.isFinite(Number(this.form.harga)) ||
        !Number.isFinite(Number(this.form.qty)) ||
        !Number.isFinite(Number(this.form.safety))
      ) {
        alert(
          "Harga, stok, dan safety stock harus berupa angka nol atau lebih.",
        );
        return;
      }

      const kode = this.form.kode.trim().toUpperCase();

      // Cek kode duplikat saat tambah
      const duplikat = this.localStok.some(
        (item) =>
          item.kode.toUpperCase() === kode &&
          (!this.modeEdit || item.kode !== this.form.kodeAsli),
      );

      if (duplikat) {
        alert("Kode bahan ajar sudah digunakan.");
        return;
      }

      const dataSimpan = {
        ...this.form,
        kode: kode,
        harga: Number(this.form.harga),
        qty: Number(this.form.qty),
        safety: Number(this.form.safety),
      };
      
      delete dataSimpan.kodeAsli;

      if (this.modeEdit) {
        const index = this.localStok.findIndex(
          (item) => item.kode === this.form.kodeAsli,
        );

        if (index !== -1) {
          this.$set(this.localStok, index, dataSimpan);
        }
      } else {
        this.localStok.push(dataSimpan);
      }

      this.$emit("update-stok", this.localStok);

      this.tampilForm = false;
      this.resetForm();

      alert(
        this.modeEdit
          ? "Data bahan ajar berhasil diperbarui."
          : "Bahan ajar berhasil ditambahkan.",
      );
    },

    hapusStok: function (item) {
      const yakin = confirm(
        "Apakah Anda yakin ingin menghapus " +
          item.kode +
          " - " +
          item.judul +
          "?",
      );

      if (!yakin) return;

      this.localStok = this.localStok.filter((data) => data.kode !== item.kode);

      this.$emit("update-stok", this.localStok);

      alert("Data bahan ajar berhasil dihapus.");
    },
  },

  created: function () {
    // Simpan kode asli untuk identifikasi ketika edit
    this.localStok = this.stok.map((item) => ({ ...item }));
  },
};
