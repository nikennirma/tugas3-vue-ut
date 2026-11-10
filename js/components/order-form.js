
window.OrderFormComponent = {
    props: {
        paketList: {
            type: Array,
            default: function () { return []; }
        },
        upbjjList: {
            type: Array,
            default: function () { return []; }
        },
        pengirimanList: {
            type: Array,
            default: function () { return []; }
        },
        tracking: {
            type: Object,
            default: function () { return {}; }
        }
    },

    data: function () {
        return {
            form: {
                nim: '',
                nama: '',
                upbjj: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.tanggalHariIni()
            },
            berhasil: false,
            nomorDOBaru: ''
        };
    },

    computed: {
        paketDipilih: function () {
            return this.paketList.find(
                item => item.kode === this.form.paket
            ) || null;
        }
    },

    methods: {
        tanggalHariIni: function () {
            const now = new Date();
            const tahun = now.getFullYear();
            const bulan = String(now.getMonth() + 1).padStart(2, '0');
            const hari = String(now.getDate()).padStart(2, '0');

            return `${tahun}-${bulan}-${hari}`;
        },

        formatRupiah: function (nilai) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
            }).format(nilai || 0);
        },

        buatNomorDO: function () {
            const tahun = new Date().getFullYear();
            const prefix = `DO${tahun}-`;

            const nomorTerakhir = Object.keys(this.tracking)
                .filter(nomor => nomor.startsWith(prefix))
                .map(nomor => {
                    return Number(nomor.substring(prefix.length)) || 0;
                })
                .reduce((maks, nomor) => Math.max(maks, nomor), 0);

            return prefix + String(nomorTerakhir + 1).padStart(4, '0');
        },

        simpanPesanan: function () {
            if (
                !this.form.nim.trim() ||
                !this.form.nama.trim() ||
                !this.form.upbjj ||
                !this.form.ekspedisi ||
                !this.form.paket ||
                !this.form.tanggalKirim
            ) {
                alert('Mohon lengkapi seluruh data pemesanan.');
                return;
            }

            if (!/^\d+$/.test(this.form.nim.trim())) {
                alert('NIM harus berupa angka.');
                return;
            }

            if (!this.paketDipilih) {
                alert('Pilih paket bahan ajar terlebih dahulu.');
                return;
            }

            const nomorDO = this.buatNomorDO();

            const pesanan = {
                nim: this.form.nim.trim(),
                nama: this.form.nama.trim(),
                upbjj: this.form.upbjj,
                status: 'Dalam Proses',
                ekspedisi: this.form.ekspedisi,
                tanggalKirim: this.form.tanggalKirim,
                paket: this.paketDipilih.kode,
                total: this.paketDipilih.harga,
                perjalanan: []
            };

            this.$emit('create-order', {
                nomorDO: nomorDO,
                detail: pesanan
            });

            this.nomorDOBaru = nomorDO;
            this.berhasil = true;

            this.resetForm();
        },

        resetForm: function () {
            this.form = {
                nim: '',
                nama: '',
                upbjj: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.tanggalHariIni()
            };
        },

        pesanLagi: function () {
            this.berhasil = false;
            this.nomorDOBaru = '';
        }
    }
};
