from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    async def generate_sql(self, question: str, schema: dict) -> str:
        raise NotImplementedError
