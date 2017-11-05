import MySQLdb
import numpy as np
import matplotlib
import Image as img
matplotlib.use("TkAgg")
from matplotlib import pyplot as plt
from Tkinter import *
import Tkinter
from PIL import ImageTk, Image
import os


im = img.open('/Users/pranavsai/Downloads/nm.png')
height = im.size[1]
im = np.array(im).astype(np.float) / 255
#
#
#
# top = Tkinter.Tk()
# top.geometry("510x510")
# menuImg = ImageTk.PhotoImage(Image.open("/Users/pranavsai/Downloads/nmlong.png"))
# panel = Label(top, image=menuImg)
# panel.pack(side = "top", fill = "both", expand = "yes")

# def closewindow():
#    quit()
#
# B = Tkinter.Button(top, text ="Close", command = closewindow)
#
# C = Tkinter.Button(top, text ="Hey")
#
# B.place(x=220, y=80)
# C.place(x=224, y=120)
#
# top.mainloop()



# from Tkinter import *
#
# master = Tk()
#
# def closeWindow():
#     exit()
#
# button = Button(master, text="close", command=closeWindow)
# button.place(x=0, y=0)
# button.pack()
#
# mainloop()




db = MySQLdb.connect(host="db4free.net",
                     port=3307,          # your host, usually localhost
                     user="management",         # your username
                     passwd="workerdata",  # your password
                     db="workerdata")        # name of the data base

# you must create a Cursor object. It will let
#  you execute all the queries you need
cur = db.cursor()

# Use all the SQL you like
cur.execute("SELECT * FROM workerdata.exercises")
workerData = cur.fetchall()
# print all the first cell of all the rows
print workerData[0][1] #First num is row, second is column




count = 0

while count < len(workerData):
    # Pie chart, where the slices will be ordered and plotted counter-clockwise:
    labels = 'Declined', 'Accepted'

    sizes = []
    total = workerData[count][2]
    total = total + 0.0
    sizes.append((total - workerData[count][3])/total) * 360)
    sizes.append((workerData[count][3] / total) * 360)

    explode = (0.05, 0)  # only "explode" the 2nd slice (i.e. 'Hogs')

    colors = ['#135259', '#514689']

    fig1, ax1= plt.subplots()
    t, t2, autotexts = ax1.pie(sizes, explode=explode, labels=labels, colors=colors, autopct='%1.1f%%',
        shadow=True, startangle=90)
    for autotext in autotexts:
        autotext.set_color('white')
    ax1.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
    ax1.xaxis.label.set_color('white')
    ax1.set_title(workerData[count][1])
    newax = fig1.add_axes([0.8, 0.8, 0.2, 0.2], anchor='NE', zorder=-1)
    newax.imshow(im)
    newax.axis('off')

    plt.show()
    count = count + 1




# for col in cur.fetchall():

db.close()


