import { atriaMessages, withAtriaMessages } from '../index';

describe('camada de tradução da Atria', () => {
  it('descobre os arquivos por varredura, sem registro manual', () => {
    expect(atriaMessages.pt_BR.KANBAN_ATRIA.TITLE).toBeTruthy();
    expect(atriaMessages.en.KANBAN_ATRIA.TITLE).toBeTruthy();
  });

  it('expõe o rótulo do item de menu que o Sidebar.vue pede', () => {
    expect(atriaMessages.pt_BR.SIDEBAR.KANBAN_ATRIA).toBeTruthy();
  });

  // O risco real deste desenho: `SIDEBAR` é definido por vários arquivos de
  // locale. Um merge raso apagaria os rótulos do upstream inteiros ao aplicar
  // o nosso. O deep merge é o que impede isso — e é isto que este teste guarda.
  it('faz merge profundo, sem apagar chaves vizinhas do upstream', () => {
    const upstream = {
      pt_BR: {
        SIDEBAR: { INBOX: 'Caixa de entrada', KANBAN: 'Kanban (pago)' },
        CONVERSATION: { HEADER: 'Conversa' },
      },
    };

    const merged = withAtriaMessages(upstream);

    expect(merged.pt_BR.SIDEBAR.INBOX).toBe('Caixa de entrada');
    expect(merged.pt_BR.SIDEBAR.KANBAN).toBe('Kanban (pago)');
    expect(merged.pt_BR.SIDEBAR.KANBAN_ATRIA).toBeTruthy();
    expect(merged.pt_BR.CONVERSATION.HEADER).toBe('Conversa');
  });

  it('deixa intacto o locale sem tradução nossa', () => {
    const upstream = { ja: { SIDEBAR: { INBOX: '受信箱' } } };

    expect(withAtriaMessages(upstream).ja.SIDEBAR.INBOX).toBe('受信箱');
  });

  it('não muta o objeto recebido', () => {
    const upstream = { pt_BR: { SIDEBAR: { INBOX: 'Caixa de entrada' } } };

    withAtriaMessages(upstream);

    expect(upstream.pt_BR.SIDEBAR.KANBAN_ATRIA).toBeUndefined();
  });
});
