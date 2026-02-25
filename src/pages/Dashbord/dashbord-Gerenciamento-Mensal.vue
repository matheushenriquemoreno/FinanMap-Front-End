<template>
  <div class="q-pa-md q-gutter-sm">
    <q-breadcrumbs class="text-grey" active-color="primary">
      <template v-slot:separator>
        <q-icon size="1.2em" name="arrow_forward" color="primary" />
      </template>
      <q-breadcrumbs-el icon="home" to="/" />
      <q-breadcrumbs-el label="Dashboard" icon="dashboard" />
    </q-breadcrumbs>
  </div>

  <div class="q-px-md">
    <BannerModoCompartilhado />
  </div>

  <q-page padding :class="$q.dark.isActive ? 'bg-dark-page' : 'bg-grey-2'">
    <div class="content-limit">

      <!-- Filter Section -->
      <div class="dashboard-section dashboard-section--delay-0">
        <SectionFiltrarPeriodo />
      </div>

      <!-- Summary Cards (KPIs) -->
      <div class="dashboard-section dashboard-section--delay-1 q-mb-lg">
        <DashboardSummaryCards />
      </div>

      <!-- Balance Card + Radial Composition -->
      <div class="row q-col-gutter-md q-mb-lg dashboard-section dashboard-section--delay-2">
        <div class="col-12 col-sm-6">
          <DashboardBalanceCard />
        </div>
        <div class="col-12 col-sm-6">
          <DashboardRadialComposition />
        </div>
      </div>

      <!-- Trend Line Chart (full width) -->
      <div class="row q-col-gutter-md q-mb-lg dashboard-section dashboard-section--delay-3">
        <div class="col-12">
          <DashboardTrendLineChart />
        </div>
      </div>

      <!-- Category Bar + Donut -->
      <div class="row q-col-gutter-md q-mb-lg dashboard-section dashboard-section--delay-4">
        <div class="col-12 col-lg-6">
          <DashboardCategoryChart />
        </div>
        <div class="col-12 col-lg-6">
          <DashboardCategoryDistributionChart />
        </div>
      </div>

      <!-- Treemap (full width) -->
      <div class="row q-col-gutter-md q-mb-lg dashboard-section dashboard-section--delay-5">
        <div class="col-12">
          <DashboardCategoryTreemap />
        </div>
      </div>

      <!-- Period Chart (full width) -->
      <div class="row q-col-gutter-md q-mb-lg dashboard-section dashboard-section--delay-5">
        <div class="col-12">
          <DashboardPeriodChart />
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import SectionFiltrarPeriodo from 'src/components/Dashbord/SectionFiltrarPeriodo.vue';
import BannerModoCompartilhado from 'src/components/Compartilhamento/BannerModoCompartilhado.vue';
import DashboardSummaryCards from 'src/components/Dashbord/DashboardSummaryCards.vue';
import DashboardCategoryChart from 'src/components/Dashbord/DashboardCategoryChart.vue';
import DashboardCategoryDistributionChart from 'src/components/Dashbord/DashboardCategoryDistributionChart.vue';
import DashboardPeriodChart from 'src/components/Dashbord/DashboardPeriodChart.vue';
// Novos componentes
import DashboardBalanceCard from 'src/components/Dashbord/DashboardBalanceCard.vue';
import DashboardTrendLineChart from 'src/components/Dashbord/DashboardTrendLineChart.vue';
import DashboardCategoryTreemap from 'src/components/Dashbord/DashboardCategoryTreemap.vue';
import DashboardRadialComposition from 'src/components/Dashbord/DashboardRadialComposition.vue';
</script>

<style scoped>
.content-limit {
  max-width: 1600px;
  margin: 0 auto;
}

/* Custom dark background */
.bg-dark-page {
  background-color: #121212;
}

/* Staggered reveal animation */
.dashboard-section {
  animation: dashReveal 0.55s ease forwards;
  opacity: 0;
  transform: translateY(16px);
}

.dashboard-section--delay-0 { animation-delay: 0ms; }
.dashboard-section--delay-1 { animation-delay: 80ms; }
.dashboard-section--delay-2 { animation-delay: 160ms; }
.dashboard-section--delay-3 { animation-delay: 240ms; }
.dashboard-section--delay-4 { animation-delay: 320ms; }
.dashboard-section--delay-5 { animation-delay: 400ms; }

@keyframes dashReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
