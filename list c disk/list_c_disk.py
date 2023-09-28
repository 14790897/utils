import os
import ctypes
import sys
from concurrent.futures import ThreadPoolExecutor
import queue

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False


if is_admin():
    # Code of your program here
    pass
else:
    ctypes.windll.shell32.ShellExecuteW(
        None, "runas", sys.executable, " ".join(sys.argv), None, 1
    )




def format_size(size):
    # 判断文件大小并格式化输出
    for unit in ["B", "KB", "MB", "GB", "TB", "PB"]:
        if size < 1024.0:
            break
        size /= 1024.0
    return f"{size:.2f} {unit}"


# def process_folder(folder_name):
#     folder_path = os.path.join(root_dir, folder_name)
#     if os.path.isdir(folder_path):
#         size = get_folder_size(folder_path)
#         print(f"Folder: {folder_name}, Size: {format_size(size)}")
#         return size
#     return 0


def worker(q, total_size):
    while not q.empty():
        folder = q.get()
        try:
            for dirpath, dirnames, filenames in os.walk(folder):
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    if os.path.exists(fp):  # 检查文件是否存在
                        total_size += os.path.getsize(fp)
                for d in dirnames:
                    dp = os.path.join(dirpath, d)
                    if os.path.isdir(dp):
                        q.put(dp)
        except Exception as e:
            print(f"An error occurred while processing {folder}: {e}")
        finally:
            q.task_done()

if __name__ == "__main__":
    root_dir = "C:\\"  # 如果你是在Windows上运行，使用'C:\\'作为根目录
    folder_queue = queue.Queue()
    folder_queue.put("C:\\")  # 初始化队列
    total_size_of_all_folders = 0  # 用于存储所有文件夹的总大小
    # 在程序开始时创建一个 ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker, folder_queue, total_size_of_all_folders) for _ in range(10)]

    print(f"Total size of all folders: {format_size(total_size_of_all_folders)}")



# def get_folder_size(folder):
#     total_size = 0
#     for dirpath, dirnames, filenames in os.walk(folder):
#         for f in filenames:
#             fp = os.path.join(dirpath, f)
#             if os.path.exists(fp):  # 检查文件是否存在
#                 total_size += os.path.getsize(fp)
#     return total_size
    # with ThreadPoolExecutor() as executor:
    #     folder_sizes = list(executor.map(process_folder, os.listdir(root_dir)))
    #     total_size_of_all_folders = sum(folder_sizes)