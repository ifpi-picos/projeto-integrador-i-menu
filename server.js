const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const cors = require("cors");
app.use(cors());

const { exec } = require("child_process");//

// Executa as migrações no início do servidor
const { execSync } = require("child_process");
if (process.env.NODE_ENV !== "production") {
    execSync("npx prisma migrate dev", { stdio: "inherit" });
}

try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Migrações aplicadas com sucesso.");
} catch (error) {
    console.error("Erro ao aplicar migrações:", error);
}

app.use(express.json());  // Só uma vez

// Rota para listar todos os usuários
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

// Rota para adicionar um usuário
app.post('/users', async (req, res) => {
    const { name, password } = req.body;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { name }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Usuário já existe." });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                password
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Erro ao criar usuário:", error.message);
        res.status(500).json({ success: false, message: "Erro ao criar usuário.", error: error.message });
    }
});


// Rota de login
app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        const usuario = await prisma.user.findFirst({
            where: { name, password },
        });

        if (usuario) {
            // Retorna o ID do usuário em caso de sucesso
            res.json({
                success: true,
                message: "Login bem-sucedido!",
                id: usuario.id,
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Nome ou senha inválidos.",
            });
        }
    } catch (error) {
        console.error("Erro no servidor:", error);
        res.status(500).json({
            success: false,
            message: "Erro interno no servidor.",
        });
    }
});




// Rota para deletar um usuário pelo ID
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        // Deleta o usuário
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        res.json({ success: true, message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error.message);
        res.status(500).json({ success: false, message: 'Erro ao deletar usuário.' });
    }
});


// Iniciar o servidor
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
