"""
Unit Tests for CODGAR Autonomous Python Task Manager
"""
import unittest
from task_manager import TaskManager

class TestTaskManager(unittest.TestCase):
    def setUp(self):
        self.tm = TaskManager()

    def test_initial_tasks_count(self):
        self.assertEqual(len(self.tm.tasks), 4)

    def test_all_initial_tasks_completed(self):
        for task in self.tm.tasks:
            self.assertTrue(task["completed"], f"Task {task['id']} should be completed")

if __name__ == "__main__":
    unittest.main(verbosity=2)
