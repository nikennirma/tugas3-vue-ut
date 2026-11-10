
window.DoTrackingComponent = {
    props: {
        tracking: {
            type: Object,
            default: function () { return {}; }
        },
        paketList: {
            type: Array,
            default: function () { return []; }
        },
        pengirimanList: {
            type: Array,
            default: function () { return []; }
        }
    },

    data: function () {
        return {
            localTracking: { ...this.tracking },
            keyword: '',
            sudahMencari: false,
            selectedDO: '',
            tampilForm: false,
            keteranganBaru: '',

            form: {
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.tanggalHariIni()
            }
        };
    },

    computed: {
        hasilPencarian: function () {
            if (!this.sudahMencari || !this.keyword.trim()) {
                return [];
            }

            const kata = this.keyword.trim().toLowerCase();

            return Object.keys(this.localTracking)
                .filter(nomorDO => {
                    const item = this.localTracking[nomorDO];

                    return nomorDO.toLowerCase().includes(kata) ||
                        String(item.nim).toLowerCase().includes(kata);
                })
                .map(nomorDO => ({
                    nomorDO: nomorDO,
                    detail: this.localTracking[nomorDO]
                }));
        },

        paketDipilih: function () {
            return this.paketList.find(
                item => item.kode === this.form.paket
            ) || null;
        },

        dataTrackingDipilih: function () {
            if (!this.selectedDO) return null;

            return this.localTracking[this.selectedDO] || null;
        }
    },

    watch: {
        tracking: {
            deep: true,
            handler: function (dataBaru) {
                this.localTracking = { ...dataBaru };
            }
        },

        'form.paket': function () {
            // Total harga otomatis mengikuti paket yang dipilih
        }
    },

    methods: {
        tanggalHariIni: function () {
            const sekarang = new Date();
            const tahun = sekarang.getFullYear();
            const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
            const tanggal = String(sekarang.getDate()).padStart(2, '0');

            return `${tahun}-${bulan}-${tanggal}`;
        },

        formatTanggal: function (tanggal) {
            if (!tanggal) return '-';

            const bagian = tanggal.split('-');
            const date = new Date(
                Number(bagian[0]),
                Number(bagian[1]) - 1,
                Number(bagian[2])
            );

            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        },

        formatRupiah: function (nilai) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(nilai || 0);
        },

        namaEkspedisi: function (kode) {
            const item = this.pengirimanList.find(
                pengiriman => pengiriman.kode === kode
            );

            return item ? item.nama : kode;
        },

        namaPaket: function (kode) {
            const item = this.paketList.find(
                paket => paket.kode === kode
            );

            return item ? item.nama : kode;
        },

        cariTracking: function () {
            this.sudahMencari = true;
            this.selectedDO = '';

            if (this.hasilPencarian.length === 1) {
                this.selectedDO = this.hasilPencarian[0].nomorDO;
            }
        },

        resetPencarian: function () {
            this.keyword = '';
            this.sudahMencari = false;
            this.selectedDO = '';
        },

        pilihTracking: function (nomorDO) {
            this.selectedDO = nomorDO;
        },

        bukaForm: function () {
            this.form = {
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.tanggalHariIni()
            };

            this.tampilForm = true;
        },

        buatNomorDO: function () {
            const tahun = new Date().getFullYear();
            const prefix = `DO${tahun}-`;

            const nomorTerakhir = Object.keys(this.localTracking)
                .filter(nomor => nomor.startsWith(prefix))
                .map(nomor => {
                    return Number(nomor.substring(prefix.length)) || 0;
                })
                .reduce((maks, nomor) => Math.max(maks, nomor), 0);

            return prefix + String(nomorTerakhir + 1).padStart(4, '0');
        },

        simpanDO: function () {
            if (
                !this.form.nim.trim() ||
                !this.form.nama.trim() ||
                !this.form.ekspedisi ||
                !this.form.paket ||
                !this.form.tanggalKirim
            ) {
                alert('Mohon lengkapi seluruh data Delivery Order.');
                return;
            }

            if (!/^\d+$/.test(this.form.nim.trim())) {
                alert('NIM harus berupa angka.');
                return;
            }

            if (!this.paketDipilih) {
                alert('Silakan pilih paket bahan ajar.');
                return;
            }

            const nomorDO = this.buatNomorDO();

            const dataBaru = {
                nim: this.form.nim.trim(),
                nama: this.form.nama.trim(),
                status: 'Dalam Proses',
                ekspedisi: this.form.ekspedisi,
                tanggalKirim: this.form.tanggalKirim,
                paket: this.form.paket,
                total: this.paketDipilih.harga,
                perjalanan: []
            };

            this.$set(this.localTracking, nomorDO, dataBaru);
            this.$emit('update-tracking', this.localTracking);

            this.tampilForm = false;
            this.keyword = nomorDO;
            this.sudahMencari = true;
            this.selectedDO = nomorDO;

            alert('Delivery Order berhasil dibuat: ' + nomorDO);
        },

        tambahProgress: function () {
            if (!this.selectedDO || !this.dataTrackingDipilih) {
                return;
            }

            if (!this.keteranganBaru.trim()) {
                alert('Masukkan keterangan progress perjalanan.');
                return;
            }

            const waktuSekarang = new Date();
            const tahun = waktuSekarang.getFullYear();
            const bulan = String(waktuSekarang.getMonth() + 1).padStart(2, '0');
            const tanggal = String(waktuSekarang.getDate()).padStart(2, '0');
            const jam = String(waktuSekarang.getHours()).padStart(2, '0');
            const menit = String(waktuSekarang.getMinutes()).padStart(2, '0');
            const detik = String(waktuSekarang.getSeconds()).padStart(2, '0');

            const waktu =
                `${tahun}-${bulan}-${tanggal} ${jam}:${menit}:${detik}`;

            this.dataTrackingDipilih.perjalanan.push({
                waktu: waktu,
                keterangan: this.keteranganBaru.trim()
            });

            this.$emit('update-tracking', this.localTracking);

            this.keteranganBaru = '';

            alert('Progress perjalanan berhasil ditambahkan.');
        }
    }
};
