import numpy as np

def multiply_matrices(size: int):
    a = np.random.rand(size, size)
    b = np.random.rand(size, size)
    res = np.dot(a, b)
    return float(res[0, 0])

if __name__ == '__main__':
    print(f"Matrix Result: {multiply_matrices(100)}")