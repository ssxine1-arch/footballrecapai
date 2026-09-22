package com.footballrecapai

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.setPadding(32, 32, 32, 32)

        val title = TextView(this)
        title.text = "⚽ Football Recap AI"
        title.textSize = 28f

        val input = EditText(this)
        input.hint = "Football News / Link ထည့်ပါ"

        val generateButton = Button(this)
        generateButton.text = "GENERATE RECAP"

        val result = TextView(this)
        result.text = "Recap Script ဒီနေရာမှာပေါ်ပါမယ်"
        result.textSize = 18f

        layout.addView(title)
        layout.addView(input)
        layout.addView(generateButton)
        layout.addView(result)

        setContentView(layout)
    }
}
