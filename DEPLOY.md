
# Guia de Publicação - LoredoLAB (Método Sem Terminal)

Este guia foi feito para publicar seu SaaS usando apenas o navegador.

## 1. Preparar os Arquivos
1. No editor onde você criou o código, procure o botão de **Download** ou **Export**.
2. Baixe o arquivo ZIP.
3. Extraia o ZIP em uma pasta no seu computador.

## 2. GitHub (Guardar o Código)
1. Acesse [github.com](https://github.com) e faça login.
2. Clique no ícone **+** (canto superior direito) -> **New repository**.
3. Nomeie como `loredolab`.
4. Clique em **Create repository**.
5. Na tela de configuração rápida, clique no link: **"uploading an existing file"**.
6. Selecione todos os arquivos da sua pasta (arraste e solte na tela do GitHub).
7. Aguarde o upload e clique no botão verde **Commit changes**.

## 3. Supabase (Banco de Dados Grátis)
1. Acesse [supabase.com](https://supabase.com) e crie um projeto "LoredoLAB".
2. Vá no menu **SQL Editor** (barra lateral esquerda).
3. Cole o conteúdo do arquivo `db/supabase_ultimate_schema.sql` (que está no seu código).
4. Clique em **Run**.
5. Vá em **Project Settings (engrenagem) -> API**.
6. Copie a `Project URL` e a `anon public` Key.

## 4. Vercel (Colocar o Site no Ar)
1. Acesse [vercel.com](https://vercel.com) e faça login com seu GitHub.
2. Clique em **Add New...** -> **Project**.
3. Selecione o repositório `loredolab` e clique em **Import**.
4. Em **Framework Preset**, selecione **Vite** (se não for automático).
5. Abra a seção **Environment Variables** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Sua URL do passo 3)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Sua Key do passo 3)
   - `API_KEY`: (Sua chave do Google Gemini AI)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: (Chave pública do Stripe)
   - `STRIPE_SECRET_KEY`: (Chave secreta do Stripe)
6. Clique em **Deploy**.

## 5. Pronto!
Seu site estará online em um link como `loredolab.vercel.app`.

---

## Dicas de Segurança (Antes de Vender)
1. No Supabase, vá em **Authentication -> Policies** e certifique-se que o RLS está ativado.
2. No Stripe, ative sua conta para "Live Mode" antes de divulgar o link para clientes reais.
