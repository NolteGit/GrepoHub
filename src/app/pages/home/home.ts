import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';

type DashboardCard = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  path: string;
  position: 'north-west' | 'north-east' | 'south-west' | 'south-east';
  angle: number;
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  @ViewChild('compassOrb') private readonly compassOrb?: ElementRef<HTMLElement>;

  protected activeCard: DashboardCard | null = null;

  protected readonly dashboardCards: DashboardCard[] = [
    {
      id: 'city-planner',
      titleKey: 'dashboard.cityPlanning.title',
      descriptionKey: 'dashboard.cityPlanning.description',
      path: '/city-planner',
      position: 'north-west',
      angle: -45,
    },
    {
      id: 'troops-planner',
      titleKey: 'dashboard.unitPlanning.title',
      descriptionKey: 'dashboard.unitPlanning.description',
      path: '/troops-planner',
      position: 'north-east',
      angle: 45,
    },
    {
      id: 'references',
      titleKey: 'dashboard.references.title',
      descriptionKey: 'dashboard.references.description',
      path: '/references',
      position: 'south-west',
      angle: -135,
    },
    {
      id: 'toolbox',
      titleKey: 'dashboard.toolbox.title',
      descriptionKey: 'dashboard.toolbox.description',
      path: '/toolbox',
      position: 'south-east',
      angle: 135,
    },
  ];

  protected get needleAngle(): string {
    return `${this.activeCard?.angle ?? 0}deg`;
  }

  protected get compassLabelKey(): string {
    return this.activeCard?.titleKey ?? 'home.compassIdle';
  }

  protected setActiveCard(card: DashboardCard, cardElement?: HTMLElement): void {
    this.activeCard = {
      ...card,
      angle: this.getPointingAngle(card, cardElement),
    };
  }

  protected clearActiveCard(): void {
    this.activeCard = null;
  }

  private getPointingAngle(card: DashboardCard, cardElement?: HTMLElement): number {
    const compassElement = this.compassOrb?.nativeElement;

    if (!compassElement || !cardElement) {
      return card.angle;
    }

    const compassRect = compassElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    const compassCenterX = compassRect.left + compassRect.width / 2;
    const compassCenterY = compassRect.top + compassRect.height / 2;
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    return Math.atan2(cardCenterX - compassCenterX, compassCenterY - cardCenterY) * (180 / Math.PI);
  }
}
