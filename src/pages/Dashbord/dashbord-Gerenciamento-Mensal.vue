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
  
  <q-page padding :class="$q.dark.isActive ? 'bg-dark-page' : 'bg-grey-2'">
    <div class="content-limit">
      <!-- Filter Section -->
      <SectionFiltrarPeriodo />

      <!-- Summary Cards -->
      <DashboardSummaryCards class="q-mb-lg" />

      <!-- Charts Section -->
      <div class="row q-col-gutter-md">
        <!-- Category Bar Chart -->
        <div class="col-12 col-lg-6">
          <DashboardCategoryChart />
        </div>

        <!-- Category Distribution Donut Chart -->
        <div class="col-12 col-lg-6">
          <DashboardCategoryDistributionChart />
        </div>

        <!-- Period Stacked Bar Chart -->
        <div class="col-12 q-mt-md">
          <DashboardPeriodChart />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import SectionFiltrarPeriodo from 'src/components/Dashbord/SectionFiltrarPeriodo.vue';
import DashboardSummaryCards from 'src/components/Dashbord/DashboardSummaryCards.vue';
import DashboardCategoryChart from 'src/components/Dashbord/DashboardCategoryChart.vue';
import DashboardCategoryDistributionChart from 'src/components/Dashbord/DashboardCategoryDistributionChart.vue';
import DashboardPeriodChart from 'src/components/Dashbord/DashboardPeriodChart.vue';
</script>

<style scoped>
.content-limit {
  max-width: 1600px;
  margin: 0 auto;
}

/* Custom dark background if not using Quasar's default dark mode classes for page background */
.bg-dark-page {
  background-color: #121212;
}
</style>
