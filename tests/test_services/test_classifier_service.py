# test_classifier_service.py
import pytest
from unittest.mock import patch, MagicMock, mock_open
import numpy as np

# Asumimos que el servicio a probar se encuentra en app.services.classifier_service
# Ajusta la ruta de importación si la estructura del proyecto es diferente.
from backend.services.classifier_service import ClassifierService

@pytest.fixture(autouse=True)
def reset_classifier_service():
    """
    Fixture para asegurar que el estado de ClassifierService se reinicie antes de cada test.
    Esto es crucial ya que usamos classmethods que modifican el estado de la clase (singleton-like).
    """
    ClassifierService._model = None
    ClassifierService._vectorizer = None
    ClassifierService._categories = None
    yield


class TestClassifierService:
    """Grupo de tests para el ClassifierService."""

    @patch("backend.services.classifier_service.pickle.load")
    @patch("builtins.open", new_callable=mock_open)
    def test_load_model_success(self, mock_file_open, mock_pickle_load):
        """
        Verifica que las rutinas de carga del modelo, vectorizador y categorías funcionan correctamente.
        """
        # Arrange
        mock_model = MagicMock()
        mock_vectorizer = MagicMock()
        mock_categories = ["Hardware", "Software", "Billing"]
        
        # Hacemos que pickle.load devuelva nuestros mocks en orden
        mock_pickle_load.side_effect = [mock_model, mock_vectorizer, mock_categories]

        model_path = "fake/model.pkl"
        vectorizer_path = "fake/vectorizer.pkl"
        categories_path = "fake/categories.pkl"

        # Act
        ClassifierService.load_model(model_path, vectorizer_path, categories_path)

        # Assert
        # Verificar que se intentó abrir los archivos correctos
        mock_file_open.assert_any_call(model_path, 'rb')
        mock_file_open.assert_any_call(vectorizer_path, 'rb')
        mock_file_open.assert_any_call(categories_path, 'rb')
        assert mock_pickle_load.call_count == 3
        
        # Verificar que los atributos de la clase se asignaron correctamente
        assert ClassifierService._model is mock_model
        assert ClassifierService._vectorizer is mock_vectorizer
        assert ClassifierService._categories is mock_categories

    def test_predict_probabilities_before_loading_raises_error(self):
        """
        Verifica que se lanza una excepción si se intenta predecir sin haber cargado el modelo.
        """
        # Arrange / Act / Assert
        with pytest.raises(RuntimeError, match="Model is not loaded. Call load_model() first."):
            ClassifierService.predict_probabilities("some input text")

    def test_predict_probabilities_correct_distribution(self):
        """
        Verifica que la distribución de categorías de clasificación es la correcta
        usando un modelo y vectorizador mockeados.
        Este es el test principal que aborda el requerimiento del issue.
        """
        # Arrange
        # 1. Crear mocks para el modelo, vectorizador y categorías
        mock_model = MagicMock()
        mock_vectorizer = MagicMock()
        categories = ["Billing", "Technical Support", "Sales"]
        
        # 2. Configurar el comportamiento de los mocks
        # El vectorizador debe tener un método 'transform'
        mock_vectorizer.transform.return_value = np.array([[0.1, 0.2, 0.3]]) # Valor de retorno dummy
        
        # El modelo debe tener un método 'predict_proba' que devuelva una distribución de probabilidad
        probabilities = np.array([[0.1, 0.8, 0.1]]) # 10% Billing, 80% Tech Support, 10% Sales
        mock_model.predict_proba.return_value = probabilities
        
        # 3. Cargar los mocks en el servicio manualmente (inyección de dependencias)
        ClassifierService._model = mock_model
        ClassifierService._vectorizer = mock_vectorizer
        ClassifierService._categories = categories

        # Act
        input_text = "My computer is not turning on."
        result = ClassifierService.predict_probabilities(input_text)
        
        # Assert
        # Verificar que el resultado es un diccionario
        assert isinstance(result, dict)

        # Verificar que la distribución de categorías es la esperada
        expected_distribution = {
            "Billing": 0.1,
            "Technical Support": 0.8,
            "Sales": 0.1,
        }
        assert result == expected_distribution

        # Verificar que se llamó a los métodos de los mocks
        mock_vectorizer.transform.assert_called_once_with([input_text])
        # np.testing.assert_array_equal es útil si se necesita comparar arrays de numpy
        mock_model.predict_proba.assert_called_once()
        
    @patch("builtins.open", side_effect=FileNotFoundError("File not found"))
    def test_load_model_file_not_found(self, mock_file_open):
        """
        Verifica que se maneja correctamente el error cuando un archivo de modelo no existe.
        """
        # Arrange
        model_path = "non_existent/model.pkl"
        vectorizer_path = "non_existent/vectorizer.pkl"
        categories_path = "non_existent/categories.pkl"

        # Act / Assert
        with pytest.raises(FileNotFoundError):
            ClassifierService.load_model(model_path, vectorizer_path, categories_path)
