import { stepHue, stepColorClasses, KANBAN_STEP_HUE } from '../kanbanStepColor';

// Hexes canônicos de docs/KANBAN-DESIGN.md §2, na ordem dos dois funis.
const FUNIL_1 = ['#94A3B8', '#38BDF8', '#6366F1', '#22C55E', '#64748B'];
const FUNIL_2 = [
  '#818CF8',
  '#38BDF8',
  '#FBBF24',
  '#10B981',
  '#F43F5E',
  '#6B7280',
];

describe('stepHue', () => {
  it('cobre as 11 etapas canônicas dos dois funis', () => {
    [...FUNIL_1, ...FUNIL_2].forEach(hex => {
      expect(stepHue(hex)).not.toBe(undefined);
      expect(KANBAN_STEP_HUE[hex]).toBeTruthy();
    });
  });

  // O `validator` de components-next/label/Label.vue aceita só estas 6.
  it('só produz hue que o design system do fork aceita', () => {
    const allowed = ['slate', 'amber', 'teal', 'ruby', 'blue', 'iris'];

    Object.values(KANBAN_STEP_HUE).forEach(hue => {
      expect(allowed).toContain(hue);
    });
  });

  // Decisão editorial do designer (§8.2): os dois cinzas NÃO são a mesma coisa.
  it('separa Perdido de Não compareceu, apesar de ambos serem cinza', () => {
    expect(stepHue('#64748B')).toBe('ruby'); // Perdido — decisão
    expect(stepHue('#6B7280')).toBe('slate'); // Não compareceu — fato
  });

  it('dá a mesma hue para a mesma cor nos dois quadros', () => {
    expect(stepHue('#38BDF8')).toBe('blue'); // Conversando e Agendado hoje
    expect(stepHue('#22C55E')).toBe(stepHue('#10B981')); // os dois terminais ✓
  });

  it('aceita hex em minúscula e com espaço', () => {
    expect(stepHue(' #22c55e ')).toBe('teal');
  });

  // Tenant que customizou a cor: cai no neutro, nunca fica sem classe.
  it('cai no neutro para hex desconhecido, nulo ou não-texto', () => {
    expect(stepHue('#123456')).toBe('slate');
    expect(stepHue(null)).toBe('slate');
    expect(stepHue(undefined)).toBe('slate');
    expect(stepHue(42)).toBe('slate');
  });
});

describe('stepColorClasses', () => {
  it('devolve as três classes para toda etapa canônica', () => {
    [...FUNIL_1, ...FUNIL_2].forEach(hex => {
      const classes = stepColorClasses(hex);

      expect(classes.dot).toMatch(/^bg-n-\w+-9$/);
      expect(classes.tint).toMatch(/^bg-n-\w+-2$/);
      expect(classes.ring).toMatch(/^ring-n-\w+-8$/);
    });
  });

  // Classe montada em runtime não sobrevive ao purge do Tailwind — por isso o
  // mapa é estático. Este teste falha se alguém trocar por template string.
  it('usa classe literal, nunca interpolada', () => {
    const source = stepColorClasses('#22C55E');

    expect(source.dot).toBe('bg-n-teal-9');
    expect(source.tint).toBe('bg-n-teal-2');
    expect(source.ring).toBe('ring-n-teal-8');
  });

  it('nunca devolve undefined, mesmo para hex desconhecido', () => {
    expect(stepColorClasses('#000000').dot).toBe('bg-n-slate-9');
  });
});
