import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { barbeiroGuard } from './core/guards/barbeiro.guard';
import { masterGuard } from './core/guards/master.guard';
import { visitanteGuard } from './core/guards/visitante.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'cadastro',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/cadastro/cadastro.component').then((m) => m.CadastroComponent)
  },
  {
    path: 'esqueci-senha',
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./pages/esqueci-senha/esqueci-senha.component').then((m) => m.EsqueciSenhaComponent)
  },
  {
    path: 'redefinir-senha',
    canActivate: [visitanteGuard],
    loadComponent: () =>
      import('./pages/redefinir-senha/redefinir-senha.component').then((m) => m.RedefinirSenhaComponent)
  },
  {
    path: 'agendar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/agendar/agendar.component').then((m) => m.AgendarComponent)
  },
  {
    path: 'painel-barbeiro',
    canActivate: [barbeiroGuard],
    loadComponent: () =>
      import('./pages/painel-barbeiro/painel-barbeiro.component').then((m) => m.PainelBarbeiroComponent)
  },
  {
    path: 'painel-master',
    canActivate: [masterGuard],
    loadComponent: () =>
      import('./pages/painel-master/painel-master.component').then((m) => m.PainelMasterComponent)
  },
  {
    path: 'agenda-geral',
    canActivate: [masterGuard],
    loadComponent: () =>
      import('./pages/agenda-geral/agenda-geral.component').then((m) => m.AgendaGeralComponent)
  },
  { path: '**', redirectTo: 'login' }
];
