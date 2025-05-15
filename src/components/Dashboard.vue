<template>
<div class="main-container wrapper">
    <Loader v-if="isLoading" />

    <!-- Accounts Section -->
    <div class="account-container">
        <div class="account-header">
            <h1>Accounts</h1>
            <div>
                <p>Total Accounts: {{ accounts.length }}</p>
            </div>
        </div>

        <div v-if="accounts.length > 0">
            <div v-for="account in accounts" :key="account.id" class="account-item" :class="{ selected: selectedAccountId === account.id }" @click="showDetails(account)">
                <div>{{ account.user_id }}</div>

                <transition name="fade">
                    <div v-if="selectedAccountId === account.id" class="account-details">
                        <div>
                            <div>Balance: {{ formatCurrency(detailObj.balance) }}</div>
                            <div>Profit: {{ formatCurrency(detailObj.profit) }}</div>
                        </div>
                        <div>
                            <div class="img-1" @click.stop="img">
                                <img :src="Image" />
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
        <p v-else>No accounts found.</p>
    </div>

    <!-- Order Details Section -->
    <transition name="slide-fade">
        <div class="object-detail">
            <div class="object-detail-header">
                <h2>Order Details</h2>
                <button @click="logout">LogOut</button>
            </div>
            <br />

            <!-- Orders Summary -->
            <div class="list-group">
                <div class="total-orders-item">
                    <h3>Total Orders Positions</h3>
                    <p>{{ detailObj.positions?.length || 0 }}</p>
                </div>

                <div class="total-orders-item">
                    <h3>Total Orders</h3>
                    <p>{{ detailObj.orders?.length || 0 }}</p>
                </div>

                <div class="balance-item">
                    <h3>Balance</h3>
                    <p>{{ formatCurrency(detailObj.balance) }}</p>
                </div>

                <div class="profit-item">
                    <h3>Total Profit</h3>
                    <p>{{ formatCurrency(detailObj.profit) }}</p>
                </div>

                <div class="profit-item">
                    <h3>All Profit</h3>
                    <div>
                        <p>{{ formatCurrency(totalAllUserProfit) }}</p>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts">
                <div class="line-chart" style="flex: 2">
                    <h3>Positions, Orders, and Deals </h3>
                    <apexchart type="line" height="350" :options="chartOptions" :series="series" />
                </div>

                <div class="donut-chart" style="flex: 1; background: #f9f9f9; border-radius: 10px; padding: 10px;">
                    <h3>Trade & Pending Order</h3>
                    <apexchart type="radialBar" height="350" :options="donutChartOptions" :series="donutChartSeries" />
                </div>
            </div>

            <!-- Profit & Loss Chart (Replacement for Candle) -->
            <div class="profit-loss-chart" style="margin-top: 20px">
                <h3>Daily Profit & Loss</h3>
                <input type="month" v-model="selectedMonth" style="margin-bottom: 10px;" />
                <apexchart type="bar" height="350" :options="profitChartOptions" :series="profitChartSeries" />
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import axios from 'axios';
import VueApexCharts from 'vue3-apexcharts';
import Loader from './Loader.vue';
import './Dashboard.css';

const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    name: 'DASHBOARD',
    components: {
        apexchart: VueApexCharts,
        Loader,
    },

    data() {
        return {
            accounts: [],
            detailObj: [],
            donutChartSeries: [],
            originalPositions: [],
            selectedAccountId: null,
            totalAllUserProfit: 0,
            isLoading: false,

            // Chart 1 (Line)
            chartOptions: {
                chart: {
                    type: 'line',
                    height: 350
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                markers: {
                    size: 4
                },
                dataLabels: {
                    enabled: false
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        format: 'dd MMM'
                    },
                    tickAmount: 7,
                },
                yaxis: {
                    title: {
                        text: 'value'
                    }
                },
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy HH:mm'
                    },
                    y: {
                        formatter: (val) => val
                    },
                },
            },
            series: [{
                    name: 'Positions',
                    data: []
                },
                {
                    name: 'Orders',
                    data: []
                },
                {
                    name: 'Deals',
                    data: []
                },
            ],

            // Chart 2 (Donut)
            donutChartOptions: {
                chart: {
                    height: 350,
                    type: 'radialBar'
                },
                plotOptions: {
                    radialBar: {
                        dataLabels: {
                            name: {
                                fontSize: '22px'
                            },
                            value: {
                                fontSize: '16px'
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                formatter: () => ''
                            },
                        },
                    },
                },
                labels: ['Trades', 'Pending'],
            },

            // Chart 3 (Column with Negative)
            selectedMonth: new Date().toISOString().slice(0, 7),
            profitChartSeries: [{
                data: []
            }],
            profitChartOptions: {
                chart: {
                    type: 'bar',
                    height: 350,
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800,
                        animateGradually: {
                            enabled: true,
                            delay: 150
                        },
                        dynamicAnimation: {
                            enabled: true,
                            speed: 350
                        }
                    }
                },
                plotOptions: {
                    bar: {
                        colors: {
                            ranges: [{
                                    from: -Infinity,
                                    to: 0,
                                    color: '#F44336',

                                },
                                {
                                    from: 0,
                                    to: Infinity,
                                    color: '#4CAF50',

                                }
                            ],
                        },
                        columnWidth: '20%',
                    },
                },
                dataLabels: {
                    enabled: false
                },
                xaxis: {
                    type: 'category',
                    title: {
                        text: 'Date',
                        
                    }

                },
                yaxis: {
                    title: {
                        text: 'Profit'
                    }
                },
                tooltip: {
                    y: {
                        formatter: val => `${val.toFixed(2)}`
                    },
                },
            },

            Image: require('../assets/time-to-market.gif'),
        };
    },

    watch: {
        selectedMonth() {
            this.updateProfitLossChart();
        },
    },

    methods: {

        // Show the details of the selected account
        async showDetails(account) {
            this.selectedAccountId = account.id;
            this.detailObj = {
                account,
                balance: account.balance,
                profit: 0,
                orders: [],
                positions: [],
                deals: [],
            };
            await this.fetchOrdersAndPositions(account.id);
        },

        //Fetch all accounts
        async fetchAccounts() {
            this.isLoading = true;
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get(`${BASE_URL}/api/v1/accounts`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });

                this.accounts = res.data.data;
                await this.calculateTotalUserProfit();
            } catch (error) {
                console.error('Error fetching accounts:', error);
            } 
                this.isLoading = false;
            
        },

        // Calculate total profit for all users
        async calculateTotalUserProfit() {
            const token = localStorage.getItem('token');
            if (!token) return;

            let totalProfit = 0;

            for (const account of this.accounts) {
                try {
                    const res = await axios.get(`${BASE_URL}/api/v1/Positions/accounts/${account.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false'
                        },
                    });

                    const positions = res.data.data;
                    positions.forEach(pos => {
                        totalProfit += Number(pos.profit || 0);
                    });
                } catch (err) {
                    console.error(`Failed for account ${account.id}:`, err);
                }
            }

            this.totalAllUserProfit = totalProfit;
        },

        // Fetch orders, positions, Deals, Trades and pending Orders for the selected account
        async fetchOrdersAndPositions(accountId) {
            const token = localStorage.getItem('token');
            if (!token) return;

            this.isLoading = true;
            try {
                const [
                    posRes, ordRes, dealRes, tradeRes, pendRes, symbolRes,
                ] = await Promise.all([
                    axios.get(`${BASE_URL}/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'false'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/deals/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            page: 1,
                            limit: 500
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/positions/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            page: 0,
                            limit: 0,
                            active: 'true'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/orders/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: {
                            page: 1,
                            limit: 500,
                            active: 'true'
                        },
                    }),
                    axios.get(`${BASE_URL}/api/v1/symbols/accounts/${accountId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    }),
                ]);

                // Extract data from responses
                const positions = posRes.data.data;
                const orders = ordRes.data.data;
                const deals = dealRes.data.data;
                const trades = tradeRes.data.data.length;
                const pending = pendRes.data.data.length;
                
               

                // Set the symbols in the store
                this.$store.dispatch('setSymbols', symbolRes.data.data);

                //Total profit for the selected account
                const totalProfit = positions.reduce((acc, pos) => acc + Number(pos.profit || 0), 0);


                // Set the detail object with the fetched data
                this.detailObj.positions = positions;
                this.detailObj.orders = orders;
                this.detailObj.deals = deals;
                this.detailObj.profit = totalProfit;
                this.originalPositions = positions;
                this.donutChartSeries = [trades, pending];
                

                // Update the chart and profit/loss chart
                this.updateChart();
                this.updateProfitLossChart();


            } catch (err) {
                console.error('Error fetching orders/positions:', err);
            } finally {
                this.isLoading = false;
            }
        },


        //Update the line chart data
        updateChart() {
            const groupByDay = (items) => {
                const grouped = {};
                items.forEach(item => {
                    const date = new Date(item.created_at / 1_000_000).toISOString().split('T')[0];
                    grouped[date] = (grouped[date] || 0) + 1;
                });
                return Object.keys(grouped).map(date => ({
                    x: new Date(date).getTime(),
                    y: grouped[date],
                }));
            };

            this.series = [{
                    name: 'Positions',
                    data: groupByDay(this.detailObj.positions)
                },
                {
                    name: 'Orders',
                    data: groupByDay(this.detailObj.orders)
                },
                {
                    name: 'Deals',
                    data: groupByDay(this.detailObj.deals)
                },
            ];
        },

        //Update the profit/loss chart data
        updateProfitLossChart() {
            if (!this.detailObj.positions) return;

            const month = this.selectedMonth;
            const dailyProfits = {};

            this.detailObj.positions.forEach(pos => {
                const date = new Date(pos.created_at / 1_000_000);
                const monthKey = date.toISOString().slice(0, 7);
                if (monthKey !== month) return;

                const day = date.toISOString().split('T')[0];
                dailyProfits[day] = (dailyProfits[day] || 0) + Number(pos.profit);
            });

            const formatted = Object.entries(dailyProfits).map(([date, profit]) => ({
                x: date,
                y: Number(profit.toFixed(2)),
            }));

            this.profitChartSeries = [{
                name: 'Profit',
                data: formatted
            }];
        },


        //Format currency
        formatCurrency(value) {
            if (!value) return '$0.00';
            return `$ ${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
        },


        //Logout function
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/');
        },

        img() {
            this.$router.push('/userchart/' + this.selectedAccountId);
        },
    },

    mounted() {
        this.fetchAccounts();
    },
};
</script>
