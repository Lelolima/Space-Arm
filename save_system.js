// Sistema de Save/Load usando localStorage
const SaveSystem = {
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log('Dados salvos com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },

    load: function(key) {
        try {
            const saveData = localStorage.getItem(key);
            if (!saveData) return null;
            
            return JSON.parse(saveData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    },

    delete: function(key) {
        localStorage.removeItem(key);
        console.log('Dados deletados com sucesso');
    }
};