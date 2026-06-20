<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <template v-slot:prepend>
        <v-btn icon="mdi-home" to="/" title="トップ" />
      </template>
      <v-app-bar-title>学習支援アプリ</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-chart-bar" to="/analysis" title="苦手分析" />
        <v-btn icon="mdi-format-list-bulleted" to="/manage" title="問題管理" />
      </template>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
